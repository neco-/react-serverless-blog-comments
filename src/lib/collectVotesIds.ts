// コメントのツリーから Votes の id を集める（返信も含む）。
// 集めた id をまとめて votesByIds に渡し、票数を 1 往復で取る。
type WithVotes = { votes?: { id?: string | null } | null; replies?: { items: WithVotes[] } }

export const collectVotesIds = (items: WithVotes[]): string[] => {
  const ids: string[] = []
  const walk = (xs: WithVotes[]) => {
    for (const x of xs) {
      if (x.votes?.id) ids.push(x.votes.id)
      if (x.replies?.items) walk(x.replies.items)
    }
  }
  walk(items)
  return [...new Set(ids)]
}
