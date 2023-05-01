/* Amplify Params - DO NOT EDIT
	API_BLOGCOMMENTS_GRAPHQLAPIIDOUTPUT
	API_BLOGCOMMENTS_VOTESTABLE_ARN
	API_BLOGCOMMENTS_VOTESTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()

const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)

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
    const result = await docClient.update(params).promise()
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
