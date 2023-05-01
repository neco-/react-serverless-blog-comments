/* Amplify Params - DO NOT EDIT
	API_BLOGCOMMENTS_COMMENTTABLE_ARN
	API_BLOGCOMMENTS_COMMENTTABLE_NAME
	API_BLOGCOMMENTS_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)

  // input
  const input = event.arguments.input
  const id = input.id
  const displayName = input?.displayName
  const content = input?.content
  const siteurl = input?.siteurl

  // TODO: validate input
  // displayName
  // content
  // siteurl

  // No need to update
  if (!displayName && !content && !siteurl) {
    try {
      // echo back
      const result = await docClient.get({ TableName: COMMENT_TABLE, Key: {id: id} }).promise()
      return {
        ...result.Item,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
      }
    } catch (err) {
      // TODO: delete votes from DB
      throw new Error(err.name + ":" + err.message)
    }
  }

  // userId
  const userId = event.identity.username

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
    const result = await docClient.update(params).promise()
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
