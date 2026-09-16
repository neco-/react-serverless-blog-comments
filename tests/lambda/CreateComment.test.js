import { mockDynamo } from './mockDynamo'
import { handler } from '../../amplify/functions/CreateComment/handler.mjs'

const event = (input, username = 'u1') => ({ arguments: { input }, identity: { username } })

describe('CreateComment', () => {
  let db
  beforeEach(() => {
    db = mockDynamo()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('Votes を先に put し、その id を持つ Comment を put する', async () => {
    const result = await handler(event({ slug: 'post-1', displayName: 'alice', content: 'hi' }))
    expect(db.calls.map((c) => c.op)).toEqual(['put', 'put'])
    const [votes, comment] = db.calls.map((c) => c.params)
    expect(votes.TableName).toBe('Votes-test')
    expect(votes.Item).toMatchObject({ upvoters: [], downvoters: [], owner: 'u1' })
    expect(comment.TableName).toBe('Comment-test')
    expect(comment.Item).toMatchObject({
      slug: 'post-1', displayName: 'alice', content: 'hi', userId: 'u1', owner: 'u1', commentVotesId: votes.Item.id,
    })
    expect(comment.Item.createdAt).toBe(comment.Item.updatedAt)
    expect(comment.Item.replyTo).toBeUndefined()
    expect(comment.Item.siteurl).toBeUndefined()
    expect(result.votes).toEqual({ id: votes.Item.id, upvoters: [], downvoters: [], owner: 'u1' })
    expect(result.id).toBe(comment.Item.id)
  })
  it('siteurl と replyTo があれば Item に入れる', async () => {
    db.respond('get', () => ({ Item: { id: 'parent', slug: 's' } }))
    await handler(event({ slug: 's', displayName: 'a', content: 'c', siteurl: 'https://a.com', replyTo: 'parent' }))
    const puts = db.calls.filter((c) => c.op === 'put')
    expect(puts[1].params.Item).toMatchObject({ siteurl: 'https://a.com', replyTo: 'parent' })
  })
  it('DynamoDB が失敗したら name:message で throw する', async () => {
    db.respond('put', () => { const e = new Error('nope'); e.name = 'X'; throw e })
    await expect(handler(event({ slug: 's', displayName: 'a', content: 'c' }))).rejects.toThrow('X:nope')
  })
})
