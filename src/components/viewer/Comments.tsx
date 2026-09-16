import { memo, useEffect, useMemo } from 'react'

import { useApiClient } from '../../lib/clients'

import {
  OnCreateCommentSubscriptionVariables,
  OnUpdateCommentSubscriptionVariables,
  OnDeleteCommentSubscriptionVariables,
} from '../../API'
import {
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
} from '../../graphql/subscriptions'

import { CommentThread } from './CommentThread'
import { useComments } from '../../hooks/useComments'

import { useAuth } from "../../hooks/useAuth"
import { useSlug } from "../../hooks/useSlug"
import { useVotes } from "../../hooks/useVotes"
import { collectVotesIds } from '../../lib/collectVotesIds'

export const Comments = memo(() => {
  const { comments, applyEvent } = useComments()
  const { slug } = useSlug()
  const { isAuthenticated } = useAuth()
  const apiClient = useApiClient()
  const { loadVotes } = useVotes()

  // 票数は投票者の一覧を出さずに取りたいので、コメント本体とは別に 1 往復でまとめて取る。
  const votesIds = useMemo(() => collectVotesIds(comments), [comments])
  const votesKey = votesIds.join(',')
  useEffect(() => {
    loadVotes(votesIds)
    // votesKey が変わったときだけ取りに行く（votesIds は毎回新しい配列になるため）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votesKey, loadVotes])

  useEffect(() => {
    console.log("useEffect in Comments: subscribe with ", slug)
    // 通知のたびに全件を取り直すと、同時に見ている人の数だけ読み取りが増える。
    // 届いたコメントを手元のツリーへ当て、当てられないときだけ取り直す。
    const onEvent = (field: string) => ({
      next: (payload: any) => {
        applyEvent(field === 'onCreateComment' ? 'created' : 'changed', payload?.data?.[field])
      },
      error: (error: unknown) => {
        console.error(error)
      },
    })
    const subscribeCreateComment = () => {
      const input: OnCreateCommentSubscriptionVariables = {
        slug: slug,
      }
      return apiClient.subscribe(onCreateComment, input, onEvent('onCreateComment'))
    }
    const subscribeUpdateComment = () => {
      const input: OnUpdateCommentSubscriptionVariables = {
        slug: slug,
      }
      return apiClient.subscribe(onUpdateComment, input, onEvent('onUpdateComment'))
    }
    const subscribeDeleteComment = () => {
      const input: OnDeleteCommentSubscriptionVariables = {
        slug: slug,
      }
      return apiClient.subscribe(onDeleteComment, input, onEvent('onDeleteComment'))
    }
    if (isAuthenticated) {
      const subCreateComment = subscribeCreateComment()
      const subUpdateComment = subscribeUpdateComment()
      const subDeleteComment = subscribeDeleteComment()
      return () => {
        subCreateComment()
        subUpdateComment()
        subDeleteComment()
      }
    }
    return () => {}
  }, [isAuthenticated, slug, applyEvent, apiClient])

  return <CommentThread comments={comments} depth={0} />
})
