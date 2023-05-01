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
