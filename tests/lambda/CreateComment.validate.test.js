import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/CreateComment/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })
const NUL = String.fromCharCode(0)

describe('CreateComment の入力検証', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  const valid = { slug: 'post-1', displayName: 'alice', content: 'hi' }
  const puts = () => db.calls.filter((c) => c.op === 'put')

  it.each([
    ['content が長すぎる', { ...valid, content: 'a'.repeat(10001) }, 'content must be 10000'],
    ['displayName が長すぎる', { ...valid, displayName: 'a'.repeat(51) }, 'displayName must be 50'],
    ['siteurl が長すぎる', { ...valid, siteurl: 'https://a.com/' + 'a'.repeat(2048) }, 'siteurl must be 2048'],
    ['slug が長すぎる', { ...valid, slug: 'a'.repeat(257) }, 'slug must be 256'],
    ['content が空', { ...valid, content: '' }, 'content is required'],
    ['displayName が空', { ...valid, displayName: '' }, 'displayName is required'],
    ['content に制御文字', { ...valid, content: `a${NUL}b` }, 'control characters'],
  ])('%s なら弾いて書き込まない', async (_name, input, message) => {
    await expect(handler(event(input))).rejects.toThrow(message)
    expect(puts()).toHaveLength(0)
  })

  it('上限ちょうどは通す', async () => {
    await handler(event({ ...valid, content: 'a'.repeat(10000), displayName: 'a'.repeat(50) }))
    expect(puts()).toHaveLength(2)
  })

  it('絵文字はコードポイントで数える（サロゲートペアで 2 文字にしない）', async () => {
    await handler(event({ ...valid, displayName: '🎉'.repeat(50) }))
    expect(puts()).toHaveLength(2)
  })

  it('改行は通す', async () => {
    await handler(event({ ...valid, content: 'a\nb\tc' }))
    expect(puts()).toHaveLength(2)
  })
})

describe('CreateComment の replyTo 検証', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  const valid = { slug: 'post-1', displayName: 'alice', content: 'hi' }
  const tree = (items) => db.respond('get', (params) => ({ Item: items[params.Key.id] }))
  const puts = () => db.calls.filter((c) => c.op === 'put')

  it('存在しない replyTo は弾く', async () => {
    tree({})
    await expect(handler(event({ ...valid, replyTo: 'nope' }))).rejects.toThrow('replyTo does not exist')
    expect(puts()).toHaveLength(0)
  })

  it('削除済みへの返信は弾く', async () => {
    tree({ p: { id: 'p', slug: 'post-1', deletedAt: '2024-01-01T00:00:00Z' } })
    await expect(handler(event({ ...valid, replyTo: 'p' }))).rejects.toThrow('deleted comment')
  })

  it('別ページの投稿への返信は弾く', async () => {
    tree({ p: { id: 'p', slug: 'other-post' } })
    await expect(handler(event({ ...valid, replyTo: 'p' }))).rejects.toThrow('another page')
  })

  it('深さ 2 への返信は弾く（画面は 3 階層までしか描かない）', async () => {
    tree({
      p2: { id: 'p2', slug: 'post-1', replyTo: 'p1' },
      p1: { id: 'p1', slug: 'post-1', replyTo: 'p0' },
      p0: { id: 'p0', slug: 'post-1' },
    })
    await expect(handler(event({ ...valid, replyTo: 'p2' }))).rejects.toThrow('too deeply nested')
    expect(puts()).toHaveLength(0)
  })

  it('深さ 1 への返信は通す', async () => {
    tree({
      p1: { id: 'p1', slug: 'post-1', replyTo: 'p0' },
      p0: { id: 'p0', slug: 'post-1' },
    })
    await handler(event({ ...valid, replyTo: 'p1' }))
    expect(puts()).toHaveLength(2)
  })

  it('深さ 0 への返信は通す', async () => {
    tree({ p0: { id: 'p0', slug: 'post-1' } })
    await handler(event({ ...valid, replyTo: 'p0' }))
    expect(puts()).toHaveLength(2)
  })
})
