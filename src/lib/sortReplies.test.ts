import { sortRepliesByUpdatedAtDesc } from './sortReplies'

const c = (id: string, updatedAt: string, replies: any[] = []) => ({ id, updatedAt, replies: { items: replies } })

describe('sortRepliesByUpdatedAtDesc', () => {
  it('各階層を updatedAt の降順に並べる', () => {
    const tree = [
      c('a', '2026-01-01T00:00:00Z', [c('a1', '2026-01-02T00:00:00Z'), c('a2', '2026-01-03T00:00:00Z', [c('a2x', '2026-01-04T00:00:00Z'), c('a2y', '2026-01-05T00:00:00Z')])]),
      c('b', '2026-02-01T00:00:00Z'),
    ]
    const sorted = sortRepliesByUpdatedAtDesc(tree)
    expect(sorted.map((x) => x.id)).toEqual(['b', 'a'])
    expect(sorted[1].replies.items.map((x: any) => x.id)).toEqual(['a2', 'a1'])
    expect(sorted[1].replies.items[0].replies.items.map((x: any) => x.id)).toEqual(['a2y', 'a2x'])
  })
  it('入力を変更しない', () => {
    const tree = [c('a', '2026-01-01T00:00:00Z'), c('b', '2026-02-01T00:00:00Z')]
    sortRepliesByUpdatedAtDesc(tree)
    expect(tree.map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('replies が無い要素も扱える', () => {
    expect(sortRepliesByUpdatedAtDesc([{ updatedAt: '2026-01-01T00:00:00Z' } as any])).toHaveLength(1)
  })
})
