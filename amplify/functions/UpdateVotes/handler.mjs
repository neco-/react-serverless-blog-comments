// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

export const handler = async (event) => {
  // event を丸ごと出すと identity.claims（メールアドレスなど）が CloudWatch に残るので出さない。
  // JSON.stringify で包むのは、id に改行を混ぜてログを偽装されないようにするため。
  console.log(`UpdateVotes: id=` + JSON.stringify(event.arguments.input?.id))

  // input
  const input = event.arguments.input
  const id = input.id
  const upvoter = input?.upvoter
  const downvoter = input?.downvoter

  // No voters
  if (!upvoter && !downvoter) {
    throw new Error("No votes.")
  }
  if (upvoter && downvoter) {
    throw new Error("Cannot vote up and down at the same time.")
  }

  // validate voter
  const voter = upvoter ?? downvoter
  const userId = event.identity.username
  if (userId !== voter) {
    throw new Error("Proxy voting is not permitted.")
  }

  // updatedAt
  const currentTime = new Date()
  const updateTime = currentTime.toISOString()

  // generate input paramters
  const UpdateExpression = `SET updatedAt = :updatedAt, #voters = list_append(#voters, :voterList)`
  const ExpressionAttributeNames = {
    '#voters': (upvoter ? "upvoters" : "downvoters")
  }
  const ExpressionAttributeValues = {
    ":updatedAt": updateTime,
    ":voterList": [voter],
    ":voter": voter
  }
  const params = {
    TableName: VOTES_TABLE,
    Key: {
      id: id
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ConditionExpression: `NOT contains(#voters, :voter)`,
    ReturnValues: "ALL_NEW"
  }

  // update comment
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
    if (err.name  === 'ConditionalCheckFailedException') {
      throw new Error("Already voted.")
    } else {
      throw new Error(err.name + ":" + err.message)
    }
  }
}
