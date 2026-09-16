import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/UpdateComment/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })

describe('UpdateComment', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  it('更新項目が無ければ get して echo back する（本人のものに限る）', async () => {
    db.respond('get', () => ({ Item: { id: 'c1', content: 'old', userId: 'u1' } }))
    const r = await handler(event({ id: 'c1' }))
    expect(db.calls).toEqual([{ op: 'get', params: { TableName: 'Comment-test', Key: { id: 'c1' } } }])
    expect(r).toMatchObject({ id: 'c1', content: 'old' })
  })
  it('更新項目が無くても他人のコメントは返さない', async () => {
    // この経路は ConditionExpression を通らないので、所有者の確認が要る
    db.respond('get', () => ({ Item: { id: 'c1', content: 'secret', userId: 'other' } }))
    await expect(handler(event({ id: 'c1' }))).rejects.toThrow('Comment not found')
  })
  it('存在しない id も同じ応答にする（存在を推測させない）', async () => {
    db.respond('get', () => ({ Item: undefined }))
    await expect(handler(event({ id: 'nope' }))).rejects.toThrow('Comment not found')
  })
  it('指定された項目だけ SET し、本人かつ未削除の条件を付ける', async () => {
    await handler(event({ id: 'c1', content: 'new' }))
    const p = db.calls[0].params
    expect(db.calls[0].op).toBe('update')
    expect(p.UpdateExpression).toBe('set updatedAt = :updatedAt, content = :content')
    expect(p.ExpressionAttributeValues).toMatchObject({ ':content': 'new', ':userId': 'u1' })
    expect(p.ConditionExpression).toBe('userId = :userId AND attribute_not_exists(deletedAt)')
    expect(p.ReturnValues).toBe('ALL_NEW')
  })
  it('displayName と siteurl も SET できる', async () => {
    await handler(event({ id: 'c1', displayName: 'b', siteurl: 'https://b.com' }))
    expect(db.calls[0].params.UpdateExpression).toBe('set updatedAt = :updatedAt, displayName = :displayName, siteurl = :siteurl')
  })
  it('失敗は name:message で throw', async () => {
    db.respond('update', () => { const e = new Error('cond'); e.name = 'ConditionalCheckFailedException'; throw e })
    await expect(handler(event({ id: 'c1', content: 'x' }))).rejects.toThrow('ConditionalCheckFailedException:cond')
  })
})

describe('UpdateComment の入力検証', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it.each([
    ['content が長すぎる', { id: 'c1', content: 'a'.repeat(10001) }, 'content must be 10000'],
    ['displayName が長すぎる', { id: 'c1', displayName: 'a'.repeat(51) }, 'displayName must be 50'],
    ['siteurl が長すぎる', { id: 'c1', siteurl: 'https://a.com/' + 'a'.repeat(2048) }, 'siteurl must be 2048'],
  ])('%s なら弾いて書き込まない', async (_name, input, message) => {
    await expect(handler(event(input))).rejects.toThrow(message)
    expect(db.calls).toHaveLength(0)
  })

  it('上限ちょうどは通す', async () => {
    await handler(event({ id: 'c1', content: 'a'.repeat(10000) }))
    expect(db.calls[0].op).toBe('update')
  })
})
