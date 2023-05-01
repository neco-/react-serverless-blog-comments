/* Amplify Params - DO NOT EDIT
	API_BLOGCOMMENTS_COMMENTTABLE_ARN
	API_BLOGCOMMENTS_COMMENTTABLE_NAME
	API_BLOGCOMMENTS_GRAPHQLAPIIDOUTPUT
	API_BLOGCOMMENTS_VOTESTABLE_ARN
	API_BLOGCOMMENTS_VOTESTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

const crypto = require("crypto")

const COMMENT_TABLE = process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME
const VOTES_TABLE = process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)

  // input
  const input = event.arguments.input
  const slug = input.slug
  const displayName = input.displayName
  const content = input.content
  const siteurl = input?.siteurl
  const replyTo = input?.replyTo

  // userId
  const userId = event.identity.username

  // TODO: validate input

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
    await docClient.put(params_votes).promise()
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
    await docClient.put(params).promise()
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
