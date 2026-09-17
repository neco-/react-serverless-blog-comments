// DynamoDB DocumentClient のモック（AWS SDK v3、aws-sdk-client-mock を使用）。
// 使い方: テストの beforeEach で呼ぶ。handler は静的 import でよい（prototype の send を差し替えるため）。
//   const db = mockDynamo()
//   db.calls            -> Array<{ op: 'put' | 'get' | 'update' | 'delete' | 'batchGet', params: object }>
//   db.respond(op, fn)  -> 以後その op の戻り値を fn(params) にする（fn が throw すれば reject）
// 既定の戻り値: put -> {}, get -> { Item: undefined }, delete -> {}, batchGet -> { Responses: { <table>: [] } },
//   update -> { Attributes: Key と ExpressionAttributeValues（先頭の ':' を除いた名前）をマージしたもの }
// SDK を差し替えるときはこのファイルの中身だけを変え、この API は変えない。
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb'

export const mockDynamo = () => {
  const state = { calls: [], responders: {} }
  const defaults = {
    put: () => ({}),
    get: () => ({ Item: undefined }),
    delete: () => ({}),
    batchGet: (params) => ({
      Responses: Object.fromEntries(Object.keys(params.RequestItems).map((t) => [t, []])),
    }),
    update: (params) => ({
      Attributes: {
        ...params.Key,
        ...Object.fromEntries(
          Object.entries(params.ExpressionAttributeValues ?? {}).map(([k, v]) => [k.slice(1), v]),
        ),
      },
    }),
  }
  const call = (op) => async (params) => {
    state.calls.push({ op, params })
    const fn = state.responders[op] ?? defaults[op]
    return fn(params)
  }
  const ddbMock = mockClient(DynamoDBDocumentClient)
  ddbMock.on(PutCommand).callsFake(call('put'))
  ddbMock.on(GetCommand).callsFake(call('get'))
  ddbMock.on(UpdateCommand).callsFake(call('update'))
  ddbMock.on(DeleteCommand).callsFake(call('delete'))
  ddbMock.on(BatchGetCommand).callsFake(call('batchGet'))
  return {
    get calls() { return state.calls },
    respond(op, fn) { state.responders[op] = fn },
  }
}
