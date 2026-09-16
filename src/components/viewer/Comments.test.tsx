import React from 'react'
import { act, waitFor, screen } from '@testing-library/react'
import { Comments } from './Comments'
import { renderWithClients } from '../../test/render'
import { FakeApiClient, FakeAuthClient } from '../../test/fakes'
import { commentsBySlugAndUpdatedAt } from '../../graphql/queries'
import { onCreateComment, onUpdateComment, onDeleteComment } from '../../graphql/subscriptions'

vi.mock('@uiw/react-markdown-preview', async () => ({ default: (await import('../../test/mockMarkdown')).MarkdownPreviewMock }))
vi.mock('@uiw/react-md-editor', async () => ({ default: (await import('../../test/mockMarkdown')).MDEditorMock }))

const comment = (id: string, content: string) => ({
  id, slug: 'post-1', displayName: 'alice', userId: 'u1', content, commentVotesId: 'v' + id,
  votes: { id: 'v' + id, upvoters: [], downvoters: [], createdAt: '', updatedAt: '', owner: 'u1' },
  replies: { items: [] }, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', owner: 'u1',
})
const signedIn = () => { const c = new FakeAuthClient(); c.user = { username: 'u1', displayName: '' }; return c }
const emptyResult = { data: { commentsBySlugAndUpdatedAt: { items: [] } } }
// 票数は別クエリ(votesByIds)でまとめて取るので、コメント取得の回数だけを見る
const commentQueries = (api: FakeApiClient) =>
  api.queries.filter((q) => q.query === commentsBySlugAndUpdatedAt)

beforeEach(() => {
  window.history.pushState({}, '', '/posts/post-1')
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('Comments', () => {
  it('返信は取得結果の順序に関係なく新しい順に表示する', async () => {
    const apiClient = new FakeApiClient()
    const parent = comment('p', 'parent')
    const older = { ...comment('r1', 'older reply'), updatedAt: '2024-01-02T00:00:00Z' }
    const newer = { ...comment('r2', 'newer reply'), updatedAt: '2024-01-03T00:00:00Z' }
    apiClient.queryResult = { data: { commentsBySlugAndUpdatedAt: { items: [{ ...parent, replies: { items: [older, newer] } }] } } }
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(screen.getByText('newer reply')).toBeInTheDocument())
    const texts = screen.getAllByText(/(newer|older) reply/).map((e) => e.textContent)
    expect(texts).toEqual(['newer reply', 'older reply'])
  })
  it('未ログイン時は IAM で slug のコメントを取得して表示する', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = { data: { commentsBySlugAndUpdatedAt: { items: [comment('1', 'hello')] } } }
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument())
    const q = commentQueries(apiClient)[commentQueries(apiClient).length - 1]
    expect(q.query).toBe(commentsBySlugAndUpdatedAt)
    expect(q.authMode).toBe('iam')
    expect(q.variables).toEqual({
      slug: 'post-1', filter: { replyTo: { attributeExists: false } }, sortDirection: 'DESC',
      limit: 100, nextToken: null,
    })
    expect(apiClient.subscriptions).toHaveLength(0)
  })
  it('ログイン時は userPool で取得し、3 種の subscription を張る', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = emptyResult
    renderWithClients(<Comments />, { apiClient, authClient: signedIn() })
    await waitFor(() => expect(apiClient.subscriptions).toHaveLength(3))
    await waitFor(() => expect(apiClient.queries.some((q) => q.authMode === 'userPool')).toBe(true))
    expect(apiClient.subscriptions.map((s) => s.query)).toEqual([onCreateComment, onUpdateComment, onDeleteComment])
    expect(apiClient.subscriptions.every((s) => JSON.stringify(s.variables) === JSON.stringify({ slug: 'post-1' }))).toBe(true)
  })
  it('ログイン時は IAM で問い合わせない（認証状態が定まるまで待つ）', async () => {
    // 署名済みの利用者が IAM で問い合わせると認証済みロールになり、AppSync に拒否される。
    const apiClient = new FakeApiClient()
    apiClient.queryResult = emptyResult
    renderWithClients(<Comments />, { apiClient, authClient: signedIn() })
    await waitFor(() => expect(commentQueries(apiClient)).toHaveLength(1))
    expect(commentQueries(apiClient).map((q) => q.authMode)).toEqual(['userPool'])
  })
  it('未ログインでも認証状態が定まるまで問い合わせない', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = emptyResult
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(commentQueries(apiClient)).toHaveLength(1))
    expect(commentQueries(apiClient).map((q) => q.authMode)).toEqual(['iam'])
  })
  it('subscription の通知で再取得する', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = emptyResult
    renderWithClients(<Comments />, { apiClient, authClient: signedIn() })
    await waitFor(() => expect(apiClient.subscriptions).toHaveLength(3))
    const before = commentQueries(apiClient).length
    act(() => apiClient.subscriptions[0].handlers.next({}))
    await waitFor(() => expect(commentQueries(apiClient).length).toBe(before + 1))
  })
  it('サインアウトで subscription を解除する', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = emptyResult
    const authClient = signedIn()
    renderWithClients(<Comments />, { apiClient, authClient })
    await waitFor(() => expect(apiClient.subscriptions).toHaveLength(3))
    act(() => authClient.emit({ type: 'signedOut' }))
    await waitFor(() => expect(apiClient.subscriptions.every((s) => !s.active)).toBe(true))
  })
})

describe('Comments のページング', () => {
  const page = (items: any[], nextToken: string | null) => ({
    data: { commentsBySlugAndUpdatedAt: { items, nextToken } },
  })

  it('nextToken が尽きるまでたどって全件を集める', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResults = [
      page([comment('1', 'first')], 't1'),
      page([comment('2', 'second')], null),
    ]
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(screen.getByText('second')).toBeInTheDocument())
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(commentQueries(apiClient).map((q: any) => q.variables.nextToken)).toEqual([null, 't1'])
  })

  it('1 ページ目が返信で埋まって 0 件でも、次のページのコメントを拾う', async () => {
    // DynamoDB の filter はページを読んだあとに効くので、items が空でも nextToken は返る。
    const apiClient = new FakeApiClient()
    apiClient.queryResults = [page([], 't1'), page([comment('1', 'hello')], null)]
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument())
  })

  it('nextToken が返り続けても上限で止まる', async () => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = page([], 'endless')
    renderWithClients(<Comments />, { apiClient })
    await waitFor(() => expect(commentQueries(apiClient).length).toBe(20))
    // 上限に達したらそれ以上は読まない
    await new Promise((r) => setTimeout(r, 50))
    expect(commentQueries(apiClient).length).toBe(20)
  })
})

describe('Comments の subscription 反映', () => {
  const loaded = (items: any[]) => ({ data: { commentsBySlugAndUpdatedAt: { items, nextToken: null } } })

  const setup = async (items: any[]) => {
    const apiClient = new FakeApiClient()
    apiClient.queryResult = loaded(items)
    renderWithClients(<Comments />, { apiClient, authClient: signedIn() })
    await waitFor(() => expect(apiClient.subscriptions).toHaveLength(3))
    await waitFor(() => expect(commentQueries(apiClient).length).toBeGreaterThan(0))
    return apiClient
  }
  const sub = (api: FakeApiClient, query: any) => api.subscriptions.find((s) => s.query === query)!

  it('届いた新規コメントを当てる（取り直さない）', async () => {
    const apiClient = await setup([comment('1', 'hello')])
    const before = commentQueries(apiClient).length
    act(() => sub(apiClient, onCreateComment).handlers.next({ data: { onCreateComment: comment('2', 'posted') } }))
    await waitFor(() => expect(screen.getByText('posted')).toBeInTheDocument())
    expect(commentQueries(apiClient).length).toBe(before)
  })

  it('届いた編集内容を当てる（取り直さない）', async () => {
    const apiClient = await setup([comment('1', 'hello')])
    const before = commentQueries(apiClient).length
    act(() => sub(apiClient, onUpdateComment).handlers.next({ data: { onUpdateComment: { ...comment('1', 'edited'), updatedAt: '2024-02-01T00:00:00Z' } } }))
    await waitFor(() => expect(screen.getByText('edited')).toBeInTheDocument())
    expect(commentQueries(apiClient).length).toBe(before)
  })

  it('削除の通知も当てる', async () => {
    const apiClient = await setup([comment('1', 'hello')])
    act(() => sub(apiClient, onDeleteComment).handlers.next({
      data: { onDeleteComment: { ...comment('1', ''), deletedAt: '2024-02-01T00:00:00Z' } },
    }))
    await waitFor(() => expect(screen.getByText('(Deleted)')).toBeInTheDocument())
  })

  it('親が手元に無い返信が届いたら取り直す', async () => {
    const apiClient = await setup([comment('1', 'hello')])
    const before = commentQueries(apiClient).length
    act(() => sub(apiClient, onCreateComment).handlers.next({
      data: { onCreateComment: { ...comment('9', 'reply'), replyTo: 'unknown' } },
    }))
    await waitFor(() => expect(commentQueries(apiClient).length).toBe(before + 1))
  })

  it('中身の無い通知なら取り直す', async () => {
    const apiClient = await setup([comment('1', 'hello')])
    const before = commentQueries(apiClient).length
    act(() => sub(apiClient, onUpdateComment).handlers.next({}))
    await waitFor(() => expect(commentQueries(apiClient).length).toBe(before + 1))
  })
})
