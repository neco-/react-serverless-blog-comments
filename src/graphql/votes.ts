// 手書き。npx ampx generate graphql-client-code では生成されないので、
// 上書きされる queries.ts / mutations.ts とは別のファイルに置く。
//
// 投票者の一覧（Cognito のユーザー名）は GraphQL に出していない。
// 画面に必要な票数と「自分が投票済みか」だけを Lambda が畳んで返す。

export type VoteSummary = {
  id: string
  upvoteCount: number
  downvoteCount: number
  votedByMe: boolean
}

export type VotesByIdsQuery = {
  votesByIds: VoteSummary[] | null
}

export const votesByIds = /* GraphQL */ `
  query VotesByIds($ids: [ID]!) {
    votesByIds(ids: $ids) {
      id
      upvoteCount
      downvoteCount
      votedByMe
    }
  }
`
