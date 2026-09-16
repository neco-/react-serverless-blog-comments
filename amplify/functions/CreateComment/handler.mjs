// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import crypto from "node:crypto"
import { validateCreateInput, validateReplyTo } from "../shared/validate.mjs"

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME
const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

export const handler = async (event) => {
  // input
  const input = event.arguments.input
  const slug = input.slug
  const displayName = input.displayName
  const content = input.content
  const siteurl = input?.siteurl
  const replyTo = input?.replyTo

  // userId
  const userId = event.identity.username

  validateCreateInput(input)

  // event を丸ごと出すと identity.claims（メールアドレスなど）が CloudWatch に残るので出さない。
  // 検証を通したあとに出す（未検証の値には改行を混ぜてログを偽装できる）。
  console.log(`CreateComment: slug=${slug}`)

  // 返信先は画面が送ってくる値をそのまま信用しない。存在・削除済み・別ページ・深さを見る。
  if (replyTo) {
    const getComment = async (id) => {
      const result = await docClient.send(new GetCommand({ TableName: COMMENT_TABLE, Key: { id } }))
      return result.Item
    }
    await validateReplyTo(replyTo, slug, getComment)
  }

  // createdAt/updatedAt
  const currentTime = new Date()
  const updateTime = currentTime.toISOString()

  // put votes in DynamoDB first
  const votesId = crypto.randomUUID()
  const params_votes = {
    TableName : VOTES_TABLE,
    Item: {
      id: votesId,
      upvoters: [],
      downvoters: [],
      owner: userId,
      createdAt: updateTime,
      updatedAt: updateTime
    }
  }
  try {
    await docClient.send(new PutCommand(params_votes))
  } catch (err) {
    throw new Error(err.name + ":" + err.message)
  }

  // generate input paramters
  const commentId = crypto.randomUUID()
  const params = {
    TableName : COMMENT_TABLE,
    Item: {
      id: commentId,
      slug: slug,
      displayName: displayName,
      userId: userId,
      owner: userId,
      content: content,
      commentVotesId: votesId,
      createdAt: updateTime,
      updatedAt: updateTime
    }
  }
  if (siteurl) params.Item.siteurl = siteurl

  // is reply?
  if (replyTo) {
    params.Item.replyTo = replyTo
  }

  // put new comment
  try {
    await docClient.send(new PutCommand(params))
  } catch (err) {
    // TODO: delete votes from DB
    throw new Error(err.name + ":" + err.message)
  }

  const votes = {
    id: votesId,
    upvoters: [],
    downvoters: [],
    owner: userId
  }
  params.Item.votes = votes

  // result
  return {
    ...params.Item,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    },
  }
}
