// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, BatchGetCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

// 投票者の一覧（Cognito のユーザー名）は返さない。
// 以前は Votes.upvoters / downvoters を AppSync がそのまま返しており、
// 未ログインでも「誰がどのコメントに投票したか」の対応表が引けた。
// 画面が要るのは票数と「自分が投票済みか」だけなので、ここで畳んで返す。

// BatchGetItem は 1 回 100 件まで。
const CHUNK = 100
// 1 ページ分のコメントより多い要求は受けない（1 記事 100 件 × 返信）。
const MAX_IDS = 1000

const chunk = (xs, size) => {
  const out = []
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size))
  return out
}

export const handler = async (event) => {
  const ids = event.arguments?.ids ?? []
  console.log(`VotesByIds: count=${ids.length}`)

  if (ids.length === 0) return []
  if (ids.length > MAX_IDS) {
    throw new Error(`Too many ids. ${MAX_IDS} or less.`)
  }

  // 未ログイン（ID プールのゲスト）は username を持たない。その場合 votedByMe は常に false。
  const userId = event.identity?.username ?? null

  // 重複を除いてから読む
  const unique = [...new Set(ids)]
  const items = []
  for (const part of chunk(unique, CHUNK)) {
    let keys = part.map((id) => ({ id }))
    // UnprocessedKeys があれば返ってきた分を除いて読み直す
    while (keys.length > 0) {
      const result = await docClient.send(
        new BatchGetCommand({ RequestItems: { [VOTES_TABLE]: { Keys: keys } } }),
      )
      items.push(...(result.Responses?.[VOTES_TABLE] ?? []))
      keys = result.UnprocessedKeys?.[VOTES_TABLE]?.Keys ?? []
    }
  }

  return items.map((item) => {
    const upvoters = item.upvoters ?? []
    const downvoters = item.downvoters ?? []
    return {
      id: item.id,
      upvoteCount: upvoters.length,
      downvoteCount: downvoters.length,
      votedByMe: userId !== null && (upvoters.includes(userId) || downvoters.includes(userId)),
    }
  })
}
