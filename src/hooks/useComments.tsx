import { useState, useEffect, useCallback, useRef } from 'react'

import { useApiClient } from '../lib/clients'
import { sortRepliesByUpdatedAtDesc } from '../lib/sortReplies'
import { applyCreated, applyChanged } from '../lib/mergeComments'
import { commentsBySlugAndUpdatedAt } from '../graphql/queries'
import { CommentsBySlugAndUpdatedAtQuery, ModelSortDirection } from '../API'

import { useAuth } from "./useAuth"
import { useSlug } from "./useSlug"

// 1 回の問い合わせで読む件数と、たどるページ数の上限。
// DynamoDB の filter はページを読んだ「あと」に効くので、返信が多い記事では
// 1 ページ目がすべて返信で埋まり、トップレベルのコメントが 0 件になることがある。
// nextToken が尽きるまでたどらないと取りこぼす。上限は暴走を止めるための保険。
export const PAGE_SIZE = 100
export const MAX_PAGES = 20

export const useComments = () => {
  const { isAuthenticated, isAuthResolved } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const { slug } = useSlug()
  const apiClient = useApiClient()

  // subscription のハンドラから最新の状態を読むための控え。
  // ハンドラは subscribe した時点の comments を閉じ込めてしまうため。
  const commentsRef = useRef<any[]>(comments)
  useEffect(() => {
    commentsRef.current = comments
  }, [comments])

  const getComments = useCallback(async () => {
    console.log("useComment Hook")
    // 認証状態が定まる前に問い合わせない。ログイン済みの利用者が IAM で問い合わせると
    // ID プールの認証済みロールになり、AppSync に Unauthorized で拒否されるため。
    if (!slug || !isAuthResolved) return
    try {
      const items: any[] = []
      let nextToken: string | null = null
      let pages = 0
      do {
        const result: any = await apiClient.query<{ data?: CommentsBySlugAndUpdatedAtQuery }>(
          commentsBySlugAndUpdatedAt,
          {
            slug: slug,
            filter: {
              replyTo: {
                attributeExists: false
              }
            },
            sortDirection: ModelSortDirection.DESC,
            limit: PAGE_SIZE,
            nextToken: nextToken,
          },
          isAuthenticated ? 'userPool' : 'iam'
        )
        const page = result?.data?.commentsBySlugAndUpdatedAt
        items.push(...(page?.items ?? []))
        nextToken = page?.nextToken ?? null
        pages += 1
      } while (nextToken && pages < MAX_PAGES)
      // 返信の並び順（新しい順）はフロントで保証する（sortReplies.ts 参照）
      setComments(sortRepliesByUpdatedAtDesc(items))
    } catch (error) {
      console.error(error)
    }
  }, [isAuthenticated, isAuthResolved, slug, apiClient])

  // subscription で届いたコメントを手元のツリーへ当てる。
  // 当てられなければ取り直す（取りこぼすより一度多く読むほうがよい）。
  const applyEvent = useCallback(
    (kind: 'created' | 'changed', incoming: any) => {
      if (!incoming?.id) {
        getComments()
        return
      }
      const current = commentsRef.current
      const next = kind === 'created' ? applyCreated(current, incoming) : applyChanged(current, incoming)
      if (next === null) {
        getComments()
        return
      }
      setComments(sortRepliesByUpdatedAtDesc(next))
    },
    [getComments],
  )

  useEffect(() => {
    getComments()
  }, [getComments])

  return {
    comments,
    getComments,
    applyEvent,
  }
}
