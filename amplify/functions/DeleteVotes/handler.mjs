// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

export const handler = async (event) => {
  // event を丸ごと出すと identity.claims（メールアドレスなど）が CloudWatch に残るので出さない。
  // JSON.stringify で包むのは、id に改行を混ぜてログを偽装されないようにするため。
  console.log(`DeleteVotes: id=` + JSON.stringify(event.arguments.input?.id))

  // input
  const input = event.arguments.input
  const id = input.id

  // validate voter
  const userId = event.identity.username

  // updatedAt
  const currentTime = new Date()
  const updateTime = currentTime.toISOString()

  // find element
  const votes = await docClient.send(new GetCommand({ TableName: VOTES_TABLE, Key: {id: id} }))
  if (!votes.Item) {
    throw new Error("Votes not found.")
  }
  const upvoters = votes.Item.upvoters ?? []
  const downvoters = votes.Item.downvoters ?? []

  const ExpressionAttributeValues = {
    ":updatedAt": updateTime,
  }

  // REMOVE は添字で消すので、読んでから書くまでの間に他の人の投票が入ると
  // 添字がずれて別人の投票を消してしまう。消す位置に自分が居ることを条件に付けて防ぐ。
  const ConditionExpressions = []
  let UpdateExpression = `SET updatedAt = :updatedAt`
  const removals = []
  const upvoter_index = upvoters.indexOf(userId)
  const downvoter_index = downvoters.indexOf(userId)
  if (upvoter_index !== -1) {
    removals.push(`upvoters[${upvoter_index}]`)
    ConditionExpressions.push(`upvoters[${upvoter_index}] = :voter`)
  }
  if (downvoter_index !== -1) {
    removals.push(`downvoters[${downvoter_index}]`)
    ConditionExpressions.push(`downvoters[${downvoter_index}] = :voter`)
  }
  if (removals.length > 0) {
    UpdateExpression += ` REMOVE ${removals.join(", ")}`
    ExpressionAttributeValues[":voter"] = userId
  }

  const params = {
    TableName: VOTES_TABLE,
    Key: {
      id: id
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ...(ConditionExpressions.length > 0 ? { ConditionExpression: ConditionExpressions.join(" AND ") } : {}),
    ReturnValues: "ALL_NEW"
  }
  // remove from upvoters
  try {
    const result = await docClient.send(new UpdateCommand(params))
    return {
      ...result.Attributes,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
    }
  } catch (err) {
    throw new Error(err.name + ":" + err.message)
  }
}
