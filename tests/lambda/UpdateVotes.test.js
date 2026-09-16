import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/UpdateVotes/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })

describe('UpdateVotes', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  it('upvoter を upvoters に追加し、二重投票を条件式で防ぐ', async () => {
    await handler(event({ id: 'v1', upvoter: 'u1' }))
    const p = db.calls[0].params
    expect(p.UpdateExpression).toBe('SET updatedAt = :updatedAt, #voters = list_append(#voters, :voterList)')
    expect(p.ExpressionAttributeNames).toEqual({ '#voters': 'upvoters' })
    expect(p.ExpressionAttributeValues).toMatchObject({ ':voterList': ['u1'], ':voter': 'u1' })
    expect(p.ConditionExpression).toBe('NOT contains(#voters, :voter)')
  })
  it('downvoter は downvoters に入る', async () => {
    await handler(event({ id: 'v1', downvoter: 'u1' }))
    expect(db.calls[0].params.ExpressionAttributeNames).toEqual({ '#voters': 'downvoters' })
  })
  it('投票者が無い、両方ある、他人の代理、はエラー', async () => {
    await expect(handler(event({ id: 'v1' }))).rejects.toThrow('No votes.')
    await expect(handler(event({ id: 'v1', upvoter: 'u1', downvoter: 'u1' }))).rejects.toThrow('Cannot vote up and down at the same time.')
    await expect(handler(event({ id: 'v1', upvoter: 'u2' }))).rejects.toThrow('Proxy voting is not permitted.')
    expect(db.calls).toHaveLength(0)
  })
  it('条件式違反は "Already voted." にする', async () => {
    db.respond('update', () => { const e = new Error('x'); e.name = 'ConditionalCheckFailedException'; throw e })
    await expect(handler(event({ id: 'v1', upvoter: 'u1' }))).rejects.toThrow('Already voted.')
  })
})
