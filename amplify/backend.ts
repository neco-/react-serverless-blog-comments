import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { createComment } from './functions/CreateComment/resource'
import { updateComment } from './functions/UpdateComment/resource'
import { deleteComment } from './functions/DeleteComment/resource'
import { updateVotes } from './functions/UpdateVotes/resource'
import { deleteVotes } from './functions/DeleteVotes/resource'
import { votesByIds } from './functions/VotesByIds/resource'

const backend = defineBackend({
  auth,
  data,
  createComment,
  updateComment,
  deleteComment,
  updateVotes,
  deleteVotes,
  votesByIds,
})

// Lambda は AppSync を介さず DynamoDB を直接読み書きする。テーブル名は環境変数で渡す。
const commentTable = backend.data.resources.tables['Comment']
const votesTable = backend.data.resources.tables['Votes']

const functions = [
  backend.createComment,
  backend.updateComment,
  backend.deleteComment,
  backend.updateVotes,
  backend.deleteVotes,
  backend.votesByIds,
]
for (const fn of functions) {
  fn.addEnvironment('API_BLOGCOMMENTS_COMMENTTABLE_NAME', commentTable.tableName)
  fn.addEnvironment('API_BLOGCOMMENTS_VOTESTABLE_NAME', votesTable.tableName)
  commentTable.grantReadWriteData(fn.resources.lambda)
  votesTable.grantReadWriteData(fn.resources.lambda)
}
