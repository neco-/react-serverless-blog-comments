import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/DeleteComment/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })

describe('DeleteComment', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  it('内容を空にして deletedAt を付ける論理削除', async () => {
    await handler(event({ id: 'c1' }))
    const p = db.calls[0].params
    expect(p.UpdateExpression).toBe('set deletedAt = :updatedAt, content = :empty, siteurl = :empty, displayName = :unknown')
    expect(p.ExpressionAttributeValues).toMatchObject({ ':userId': 'u1', ':empty': '', ':unknown': 'Unknown' })
    expect(p.ConditionExpression).toBe('userId = :userId AND attribute_not_exists(deletedAt)')
  })
  it('削除したコメントに紐づく Votes を空にする', async () => {
    db.respond('update', (params) =>
      params.TableName === 'Comment-test'
        ? { Attributes: { id: 'c1', commentVotesId: 'v1' } }
        : { Attributes: {} })
    await handler(event({ id: 'c1' }))
    expect(db.calls.map((c) => c.op)).toEqual(['update', 'update'])
    const p = db.calls[1].params
    expect(p.TableName).toBe('Votes-test')
    expect(p.Key).toEqual({ id: 'v1' })
    expect(p.UpdateExpression).toBe('SET upvoters = :empty, downvoters = :empty, updatedAt = :updatedAt')
    expect(p.ExpressionAttributeValues[':empty']).toEqual([])
  })
  it('Votes の初期化に失敗しても、削除そのものは成功として返す', async () => {
    db.respond('update', (params) => {
      if (params.TableName === 'Comment-test') return { Attributes: { id: 'c1', commentVotesId: 'v1' } }
      throw new Error('votes update failed')
    })
    const result = await handler(event({ id: 'c1' }))
    expect(result.id).toBe('c1')
  })
  it('commentVotesId が無ければ Votes は触らない', async () => {
    await handler(event({ id: 'c1' }))
    expect(db.calls.map((c) => c.op)).toEqual(['update'])
  })
  it('他人のもの・削除済みは画面に出せる文言で失敗する（どちらかは伝えない）', async () => {
    db.respond('update', () => { const e = new Error('cond'); e.name = 'ConditionalCheckFailedException'; throw e })
    await expect(handler(event({ id: 'c1' }))).rejects.toThrow('UserError: Comment not found.')
  })
  it('それ以外の失敗は name:message で throw', async () => {
    db.respond('update', () => { const e = new Error('boom'); e.name = 'X'; throw e })
    await expect(handler(event({ id: 'c1' }))).rejects.toThrow('X:boom')
  })
})
