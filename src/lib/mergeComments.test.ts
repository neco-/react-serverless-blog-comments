import { applyCreated, applyChanged, MergeableComment } from './mergeComments'

type C = MergeableComment & { content?: string }

const c = (id: string, replyTo?: string, replies: C[] = [], content = id): C => ({
  id,
  replyTo,
  content,
  replies: { items: replies },
})

// p0
//  └ r1
//      └ r2
const tree = (): C[] => [c('p0', undefined, [c('r1', 'p0', [c('r2', 'r1')])]), c('other')]

describe('applyCreated', () => {
  it('トップレベルは先頭に足す', () => {
    const next = applyCreated(tree(), c('new'))!
    expect(next.map((x) => x.id)).toEqual(['new', 'p0', 'other'])
  })

  it('返信は親の replies の先頭に足す', () => {
    const next = applyCreated(tree(), c('new', 'p0'))!
    expect(next[0].replies!.items.map((x) => x.id)).toEqual(['new', 'r1'])
  })

  it('孫の階層にも足せる', () => {
    const next = applyCreated(tree(), c('new', 'r1'))!
    expect(next[0].replies!.items[0].replies!.items.map((x) => x.id)).toEqual(['new', 'r2'])
  })

  it('親が手元に無ければ null（呼び出し側が取り直す）', () => {
    expect(applyCreated(tree(), c('new', 'unknown'))).toBeNull()
  })

  it('同じ通知が二度来ても増やさない', () => {
    const before = tree()
    expect(applyCreated(before, c('r1', 'p0'))).toBe(before)
  })

  it('元の配列を書き換えない', () => {
    const before = tree()
    applyCreated(before, c('new', 'p0'))
    expect(before[0].replies!.items.map((x) => x.id)).toEqual(['r1'])
  })
})

describe('applyChanged', () => {
  it('トップレベルの内容を差し替える', () => {
    const next = applyChanged(tree(), { ...c('p0'), content: 'edited' })!
    expect(next[0].content).toBe('edited')
  })

  it('入れ子の返信も差し替えられる', () => {
    const next = applyChanged(tree(), { ...c('r2', 'r1'), content: 'edited' })!
    // replies.items の要素は MergeableComment 止まりなので（sortReplies.ts と同じ）、
    // テスト側で元の型に戻して中身を見る
    const grandchild = next[0].replies!.items[0].replies!.items[0] as C
    expect(grandchild.content).toBe('edited')
  })

  it('手元の replies を残す（届いた側の replies で上書きしない）', () => {
    // 届いた p0 は replies が空。手元の r1 を落としてはいけない。
    const incoming: C = { id: 'p0', replies: { items: [] }, content: 'edited' }
    const next = applyChanged<C>(tree(), incoming)!
    expect(next[0].replies!.items.map((x) => x.id)).toEqual(['r1'])
  })

  it('見つからなければ null', () => {
    expect(applyChanged(tree(), c('unknown'))).toBeNull()
  })

  it('元の配列を書き換えない', () => {
    const before = tree()
    applyChanged(before, { ...c('p0'), content: 'edited' })
    expect(before[0].content).toBe('p0')
  })
})
