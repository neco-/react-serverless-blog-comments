// AWS SDK v3（Gen2 のデプロイ時に esbuild がルートの devDependencies からバンドルする）
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { validateUpdateInput } from "../shared/validate.mjs"

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME

export const handler = async (event) => {
  // event を丸ごと出すと identity.claims（メールアドレスなど）が CloudWatch に残るので出さない。
  // JSON.stringify で包むのは、id に改行を混ぜてログを偽装されないようにするため。
  console.log(`UpdateComment: id=` + JSON.stringify(event.arguments.input?.id))

  // input
  const input = event.arguments.input
  const id = input.id
  const displayName = input?.displayName
  const content = input?.content
  const siteurl = input?.siteurl

  validateUpdateInput(input)

  // userId
  const userId = event.identity.username

  // No need to update
  if (!displayName && !content && !siteurl) {
    // 更新する項目が無いので今の内容を返すだけ。ただしこの経路は下の
    // ConditionExpression を通らないので、所有者の確認をここで行う。
    // 付けないと、任意の id を渡して他人のレコードを引ける。
    let item
    try {
      // echo back
      const result = await docClient.send(new GetCommand({ TableName: COMMENT_TABLE, Key: {id: id} }))
      item = result.Item
    } catch (err) {
      throw new Error(err.name + ":" + err.message)
    }
    // 存在しない場合と他人のものの場合で応答を変えない（存在を推測させないため）
    if (!item || item.userId !== userId) {
      throw new Error("Comment not found.")
    }
    return {
      ...item,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
    }
  }

  // updatedAt
  const currentTime = new Date()
  const updateTime = currentTime.toISOString()

  // generate input paramters
  const UpdateExpression = ("set updatedAt = :updatedAt"
                       + (displayName ? ", displayName = :displayName" : "")
                       + (content ? ", content = :content" : "")
                       + (siteurl ? ", siteurl = :siteurl" : ""))
  const ExpressionAttributeValues = {
    ":updatedAt": updateTime,
    ":userId": userId
  }
  if (displayName) ExpressionAttributeValues[":displayName"] = displayName
  if (content) ExpressionAttributeValues[":content"] = content
  if (siteurl) ExpressionAttributeValues[":siteurl"] = siteurl
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
