// 投票者の一覧は GraphQL に出していない（誰が投票したかを公開しないため）。
// 票数と「自分が投票済みか」は useVotes 経由で votes.id をキーに引く。
export type VotesProps = {
  id: string
  createdAt: string
  updatedAt: string
}
