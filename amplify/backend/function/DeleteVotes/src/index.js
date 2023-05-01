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

  // validate voter
  const userId = event.identity.username

  // updatedAt
  const currentTime = new Date()
  const updateTime = currentTime.toISOString()

  // find element
  // TODO: error handling
  const votes = await docClient.get({ TableName: VOTES_TABLE, Key: {id: id} }).promise()
  const ExpressionAttributeValues = {
    ":updatedAt": updateTime,
  }

  let UpdateExpression = `SET updatedAt = :updatedAt`
  const upvoter_index = votes.Item.upvoters.indexOf(userId)
  const downvoter_index = votes.Item.downvoters.indexOf(userId)
  if (upvoter_index !== -1 && downvoter_index !== -1) {
    UpdateExpression += ` REMOVE upvoters[${upvoter_index}], downvoters[${downvoter_index}]`
  } else if (upvoter_index === -1 && downvoter_index !== -1) {
    UpdateExpression += ` REMOVE downvoters[${downvoter_index}]`
  } else if (upvoter_index !== -1 && downvoter_index === -1) {
    UpdateExpression += ` REMOVE upvoters[${upvoter_index}]`
  }
  const params = {
    TableName: VOTES_TABLE,
    Key: {
      id: id
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }
  // remove from upvoters
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
    throw new Error(err.name + ":" + err.message)
  }
}
