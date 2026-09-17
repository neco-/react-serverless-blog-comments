// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { UserError } from "../shared/userError.mjs"

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME
const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

export const handler = async (event) => {
  // event を丸ごと出すと identity.claims（メールアドレスなど）が CloudWatch に残るので出さない。
  // JSON.stringify で包むのは、id に改行を混ぜてログを偽装されないようにするため。
  console.log(`DeleteComment: id=` + JSON.stringify(event.arguments.input?.id))

  // input
  const input = event.arguments.input
  const id = input.id

  // userId
  const userId = event.identity.username

  // updatedAt
  const currentTime = new Date()
  const updatedTime = currentTime.toISOString()

  // generate input paramters
  const UpdateExpression = ("set deletedAt = :updatedAt"
                            + ", content = :empty"
                            + ", siteurl = :empty"
                            + ", displayName = :unknown")
  const ExpressionAttributeValues = {
    ":updatedAt": updatedTime,
    ":userId": userId,
    ":empty": "",
    ":unknown": "Unknown",
  }
  const params = {
    TableName: COMMENT_TABLE,
    Key: {
      id: id
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ConditionExpression: `userId = :userId AND attribute_not_exists(deletedAt)`,
    ReturnValues: "ALL_NEW"
  }

  // update comment
  try {
    const result = await docClient.send(new UpdateCommand(params))

    // 本文と一緒に投票も無かったことにする。行そのものは消さない。
    // Comment.commentVotesId は必須で、votesByIds はこの行を引いて票数を返すため。
    // ここが失敗しても削除はもう済んでいる。投票が残るだけなので、削除自体は成功として返す。
    const votesId = result.Attributes?.commentVotesId
    if (votesId) {
      try {
        await docClient.send(new UpdateCommand({
          TableName: VOTES_TABLE,
          Key: { id: votesId },
          UpdateExpression: "SET upvoters = :empty, downvoters = :empty, updatedAt = :updatedAt",
          ExpressionAttributeValues: { ":empty": [], ":updatedAt": updatedTime },
        }))
      } catch (votesErr) {
        console.log(`DeleteComment: votes reset failed id=${JSON.stringify(votesId)} ${votesErr.name}`)
      }
    }

    return {
      ...result.Attributes,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
    }
  } catch (err) {
    // 条件は「本人のもの、かつ未削除」。他人のものか、もう消えているか。
    // どちらなのかを伝えると他人のコメントの存在を確かめられてしまうので、区別せず同じ応答にする。
    if (err.name === "ConditionalCheckFailedException") {
      throw new UserError("Comment not found.")
    }
    throw new Error(err.name + ":" + err.message)
  }
}
