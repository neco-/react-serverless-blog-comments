import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/DeleteVotes/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })

describe('DeleteVotes', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  it('自分が upvoters にいればその index を REMOVE する', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: ['a', 'u1'], downvoters: [] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls.map((c) => c.op)).toEqual(['get', 'update'])
    expect(db.calls[1].params.UpdateExpression).toBe('SET updatedAt = :updatedAt REMOVE upvoters[1]')
  })
  it('downvoters だけにいればそちらを REMOVE する', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: [], downvoters: ['u1'] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.UpdateExpression).toBe('SET updatedAt = :updatedAt REMOVE downvoters[0]')
  })
  it('両方にいれば両方 REMOVE する', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: ['u1'], downvoters: ['x', 'u1'] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.UpdateExpression).toBe('SET updatedAt = :updatedAt REMOVE upvoters[0], downvoters[1]')
  })
  it('どちらにもいなければ updatedAt だけ更新する', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: [], downvoters: [] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.UpdateExpression).toBe('SET updatedAt = :updatedAt')
  })
})

describe('DeleteVotes の堅牢性', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('存在しない id なら update せずに落とす', async () => {
    db.respond('get', () => ({ Item: undefined }))
    await expect(handler(event({ id: 'nope' }))).rejects.toThrow('Votes not found')
    expect(db.calls.map((c) => c.op)).toEqual(['get'])
  })

  it('upvoters / downvoters 属性が無くても落ちない', async () => {
    db.respond('get', () => ({ Item: { id: 'v1' } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.UpdateExpression).toBe('SET updatedAt = :updatedAt')
  })

  it('消す位置に自分が居ることを条件に付ける（読んでから書くまでのずれ対策）', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: ['a', 'u1'], downvoters: [] } }))
    await handler(event({ id: 'v1' }))
    const p = db.calls[1].params
    expect(p.ConditionExpression).toBe('upvoters[1] = :voter')
    expect(p.ExpressionAttributeValues[':voter']).toBe('u1')
  })

  it('両方から消すときは両方に条件を付ける', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: ['u1'], downvoters: ['x', 'u1'] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.ConditionExpression).toBe('upvoters[0] = :voter AND downvoters[1] = :voter')
  })

  it('消すものが無いときは条件を付けない', async () => {
    db.respond('get', () => ({ Item: { id: 'v1', upvoters: [], downvoters: [] } }))
    await handler(event({ id: 'v1' }))
    expect(db.calls[1].params.ConditionExpression).toBeUndefined()
  })
})
