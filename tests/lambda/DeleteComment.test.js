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
  it('失敗は name:message で throw', async () => {
    db.respond('update', () => { const e = new Error('cond'); e.name = 'ConditionalCheckFailedException'; throw e })
    await expect(handler(event({ id: 'c1' }))).rejects.toThrow('ConditionalCheckFailedException:cond')
  })
})
