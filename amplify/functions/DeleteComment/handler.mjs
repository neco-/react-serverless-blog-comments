// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME

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

  // TODO: initialize votes

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
    return {
      ...result.Attributes,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
    }
  } catch (err) {
    // TODO: handle ConditionalCheckFailedException
    throw new Error(err.name + ":" + err.message)
  }
}
