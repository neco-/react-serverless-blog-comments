import { collectVotesIds } from './collectVotesIds'

const c = (voteId: string | null, replies: any[] = []) => ({
  votes: voteId ? { id: voteId } : null,
  replies: { items: replies },
})

describe('collectVotesIds', () => {
  it('返信の階層もたどって集める', () => {
    expect(collectVotesIds([c('v1', [c('v2', [c('v3')])]), c('v4')])).toEqual(['v1', 'v2', 'v3', 'v4'])
  })
  it('重複は取り除く', () => {
    expect(collectVotesIds([c('v1'), c('v1')])).toEqual(['v1'])
  })
  it('votes が無い要素は飛ばす', () => {
    expect(collectVotesIds([c(null, [c('v1')])])).toEqual(['v1'])
  })
  it('空なら空', () => {
    expect(collectVotesIds([])).toEqual([])
  })
})
