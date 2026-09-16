import { defineFunction } from '@aws-amplify/backend'

export const deleteVotes = defineFunction({
  name: 'DeleteVotes',
  entry: './handler.mjs',
  runtime: 22,
  timeoutSeconds: 25,
  // ログを無期限に残さない。既定は infinite で、消さない限り溜まり続ける。
  logging: { retention: '3 years' },
  // data のリゾルバとして使い、テーブル名と権限も data から受け取るので data スタックに同居させる（循環依存の回避）
  resourceGroupName: 'data',
})
