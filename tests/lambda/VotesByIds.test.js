import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/VotesByIds/handler.mjs'

const TABLE = 'Votes-test'
const event = (ids, username) => ({ arguments: { ids }, identity: username ? { username } : undefined })
const rows = (items) => ({ Responses: { [TABLE]: items } })

describe('VotesByIds', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('票数に畳んで返す。投票者の一覧は返さない', async () => {
    db.respond('batchGet', () => rows([{ id: 'v1', upvoters: ['a', 'b'], downvoters: ['c'] }]))
    const result = await handler(event(['v1'], 'a'))
    expect(result).toEqual([{ id: 'v1', upvoteCount: 2, downvoteCount: 1, votedByMe: true }])
    expect(JSON.stringify(result)).not.toContain('upvoters')
    expect(JSON.stringify(result)).not.toContain('"b"')
  })

  it('自分が入っていなければ votedByMe は false', async () => {
    db.respond('batchGet', () => rows([{ id: 'v1', upvoters: ['a'], downvoters: [] }]))
    const result = await handler(event(['v1'], 'z'))
    expect(result[0].votedByMe).toBe(false)
  })

  it('未ログイン（username なし）でも票数は返し、votedByMe は false', async () => {
    db.respond('batchGet', () => rows([{ id: 'v1', upvoters: ['a'], downvoters: [] }]))
    const result = await handler(event(['v1']))
    expect(result[0]).toMatchObject({ upvoteCount: 1, votedByMe: false })
  })

  it('upvoters / downvoters 属性が無くても 0 を返す', async () => {
    db.respond('batchGet', () => rows([{ id: 'v1' }]))
    expect(await handler(event(['v1'], 'a'))).toEqual([
      { id: 'v1', upvoteCount: 0, downvoteCount: 0, votedByMe: false },
    ])
  })

  it('id が空なら問い合わせない', async () => {
    expect(await handler(event([]))).toEqual([])
    expect(db.calls).toHaveLength(0)
  })

  it('重複した id は 1 回にまとめて渡す', async () => {
    db.respond('batchGet', () => rows([{ id: 'v1', upvoters: [], downvoters: [] }]))
    await handler(event(['v1', 'v1', 'v1'], 'a'))
    expect(db.calls[0].params.RequestItems[TABLE].Keys).toEqual([{ id: 'v1' }])
  })

  it('100 件を超えたら分割して読む', async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `v${i}`)
    db.respond('batchGet', () => rows([]))
    await handler(event(ids, 'a'))
    expect(db.calls.map((c) => c.params.RequestItems[TABLE].Keys.length)).toEqual([100, 100, 50])
  })

  it('UnprocessedKeys があれば読み直す', async () => {
    let call = 0
    db.respond('batchGet', () => {
      call += 1
      return call === 1
        ? { Responses: { [TABLE]: [{ id: 'v1', upvoters: [], downvoters: [] }] }, UnprocessedKeys: { [TABLE]: { Keys: [{ id: 'v2' }] } } }
        : rows([{ id: 'v2', upvoters: ['a'], downvoters: [] }])
    })
    const result = await handler(event(['v1', 'v2'], 'a'))
    expect(db.calls).toHaveLength(2)
    expect(result.map((r) => r.id)).toEqual(['v1', 'v2'])
  })

  it('id が多すぎたら弾く', async () => {
    const ids = Array.from({ length: 1001 }, (_, i) => `v${i}`)
    await expect(handler(event(ids, 'a'))).rejects.toThrow('Too many ids')
    expect(db.calls).toHaveLength(0)
  })
})
