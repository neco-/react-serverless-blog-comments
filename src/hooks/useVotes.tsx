import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

import { useApiClient } from '../lib/clients'
import { votesByIds, VoteSummary, VotesByIdsQuery } from '../graphql/votes'
import { useAuth } from './useAuth'

// 票数と「自分が投票済みか」を保持する。
// 投票者の一覧は GraphQL に出していないので、コメント本体とは別に
// votesByIds でまとめて取る（Lambda が畳んで返す）。

type VotesState = {
  summaries: Map<string, VoteSummary>
  loadVotes: (ids: string[]) => void
  // 投票直後に手元の数字を合わせる（再取得を待たせない）
  applyLocalVote: (id: string, voted: boolean) => void
}

const VotesContext = createContext<VotesState>({
  summaries: new Map(),
  loadVotes: () => {},
  applyLocalVote: () => {},
})

export const useVotes = () => useContext(VotesContext)

// initial はテストで初期値を差し込むため（本番では渡さない）。
export const VotesContextProvider = ({
  children,
  initial = [],
}: {
  children: React.ReactNode
  initial?: VoteSummary[]
}) => {
  const { isAuthenticated, isAuthResolved } = useAuth()
  const apiClient = useApiClient()
  const [summaries, setSummaries] = useState<Map<string, VoteSummary>>(
    () => new Map(initial.map((item) => [item.id, item])),
  )
  // 同じ組み合わせを二度取りに行かないための控え
  const lastKey = useRef<string>('')

  const loadVotes = useCallback(
    (ids: string[]) => {
      if (!isAuthResolved || ids.length === 0) return
      const key = `${isAuthenticated ? 'u' : 'g'}:${ids.join(',')}`
      if (lastKey.current === key) return
      lastKey.current = key
      const run = async () => {
        try {
          const result = await apiClient.query<{ data?: VotesByIdsQuery }>(
            votesByIds,
            { ids },
            isAuthenticated ? 'userPool' : 'iam',
          )
          const items = result?.data?.votesByIds ?? []
          setSummaries(new Map(items.map((item) => [item.id, item])))
        } catch (error) {
          console.error(error)
        }
      }
      run()
    },
    [apiClient, isAuthenticated, isAuthResolved],
  )

  const applyLocalVote = useCallback((id: string, voted: boolean) => {
    setSummaries((prev) => {
      const current = prev.get(id)
      if (!current || current.votedByMe === voted) return prev
      const next = new Map(prev)
      next.set(id, {
        ...current,
        votedByMe: voted,
        upvoteCount: Math.max(0, current.upvoteCount + (voted ? 1 : -1)),
      })
      return next
    })
  }, [])

  return (
    <VotesContext.Provider value={{ summaries, loadVotes, applyLocalVote }}>{children}</VotesContext.Provider>
  )
}
