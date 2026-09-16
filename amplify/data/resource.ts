import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { createComment } from '../functions/CreateComment/resource'
import { updateComment } from '../functions/UpdateComment/resource'
import { deleteComment } from '../functions/DeleteComment/resource'
import { updateVotes } from '../functions/UpdateVotes/resource'
import { deleteVotes } from '../functions/DeleteVotes/resource'
import { votesByIds } from '../functions/VotesByIds/resource'

// Gen1 の schema.graphql と同じ GraphQL API を生成する。
// - 全員が読み取り可能（未ログインは IAM（ID プールの unauth ロール）、ログイン済みはユーザープール）
// - 書き込みは Lambda 経由のカスタム mutation のみ（ログインユーザー）。Lambda が userId を検査する
// - 自動生成の CRUD mutation / subscription / get / list は無効化し、インデックスのクエリだけ残す
// - subscription は slug 単位（onCommentEvent.js でフィルタ）
const schema = a.schema({
  Comment: a
    .model({
      slug: a.string().required(),
      displayName: a.string().required(),
      userId: a.string(),
      content: a.string().required(),
      siteurl: a.string(),
      commentVotesId: a.id().required(),
      votes: a.belongsTo('Votes', 'commentVotesId'),
      replyTo: a.id(),
      parent: a.belongsTo('Comment', 'replyTo'),
      replies: a.hasMany('Comment', 'replyTo'),
      createdAt: a.string().required(),
      updatedAt: a.string().required(),
      deletedAt: a.string(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index('slug').sortKeys(['updatedAt']).queryField('commentsBySlugAndUpdatedAt'),
      index('replyTo').sortKeys(['updatedAt']).queryField('commentsByReplyToAndUpdatedAt'),
    ])
    .disableOperations(['mutations', 'subscriptions', 'get', 'list'])
    .authorization((allow) => [allow.guest().to(['read']), allow.authenticated().to(['read'])]),

  // upvoters / downvoters / owner は GraphQL に出さない。誰が投票したかを公開しないため。
  // DynamoDB の項目としては Lambda が今までどおり読み書きする（votesByIds で票数に畳んで返す）。
  Votes: a
    .model({
      createdAt: a.string().required(),
      updatedAt: a.string().required(),
      comment: a.hasOne('Comment', 'commentVotesId'),
    })
    .disableOperations(['mutations', 'subscriptions', 'get', 'list'])
    .authorization((allow) => [allow.guest().to(['read']), allow.authenticated().to(['read'])]),

  // カスタム mutation の入力型。customType を引数に使うと Gen2 は `<型名>Input` という input 型を生成するので、
  // Gen1 と同じ `CreateCommentInput` などになるよう型名は `CreateComment` などにしている。
  // 新規投稿 / 返信投稿
  CreateComment: a.customType({
    slug: a.string().required(),
    displayName: a.string().required(),
    content: a.string().required(),
    siteurl: a.string(),
    replyTo: a.id(),
    commentVotesId: a.id(),
  }),
  // 投稿編集
  UpdateComment: a.customType({
    id: a.id().required(),
    displayName: a.string(),
    content: a.string(),
    siteurl: a.string(),
  }),
  // 投稿削除
  DeleteComment: a.customType({
    id: a.id().required(),
  }),
  // Voting
  UpdateVotes: a.customType({
    id: a.id().required(),
    upvoter: a.string(),
    downvoter: a.string(),
  }),
  DeleteVotes: a.customType({
    id: a.id().required(),
  }),

  createComment: a
    .mutation()
    .arguments({ input: a.ref('CreateComment').required() })
    .returns(a.ref('Comment'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createComment)),
  updateComment: a
    .mutation()
    .arguments({ input: a.ref('UpdateComment').required() })
    .returns(a.ref('Comment'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(updateComment)),
  deleteComment: a
    .mutation()
    .arguments({ input: a.ref('DeleteComment').required() })
    .returns(a.ref('Comment'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(deleteComment)),
  updateVotes: a
    .mutation()
    .arguments({ input: a.ref('UpdateVotes').required() })
    .returns(a.ref('Votes'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(updateVotes)),
  deleteVotes: a
    .mutation()
    .arguments({ input: a.ref('DeleteVotes').required() })
    .returns(a.ref('Votes'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(deleteVotes)),

  // 票数と「自分が投票済みか」だけを返す。投票者の一覧は外に出さない。
  VoteSummary: a.customType({
    id: a.id().required(),
    upvoteCount: a.integer().required(),
    downvoteCount: a.integer().required(),
    votedByMe: a.boolean().required(),
  }),
  votesByIds: a
    .query()
    .arguments({ ids: a.id().array().required() })
    .returns(a.ref('VoteSummary').array())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(votesByIds)),

  // slug 単位で購読する（Votes のリアルタイム更新は今のところ不要）
  onCreateComment: a
    .subscription()
    .for(a.ref('createComment'))
    .arguments({ slug: a.string().required() })
    .handler(a.handler.custom({ entry: './onCommentEvent.js' }))
    .authorization((allow) => [allow.authenticated()]),
  onUpdateComment: a
    .subscription()
    .for(a.ref('updateComment'))
    .arguments({ slug: a.string().required() })
    .handler(a.handler.custom({ entry: './onCommentEvent.js' }))
    .authorization((allow) => [allow.authenticated()]),
  onDeleteComment: a
    .subscription()
    .for(a.ref('deleteComment'))
    .arguments({ slug: a.string().required() })
    .handler(a.handler.custom({ entry: './onCommentEvent.js' }))
    .authorization((allow) => [allow.authenticated()]),
})

export type Schema = ClientSchema<typeof schema>

// デプロイ前に生成される GraphQL SDL を確認するため（scripts/print-schema.ts）
export const schemaSdl = () => schema.transform().schema

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
