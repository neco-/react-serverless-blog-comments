import React from 'react'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RowFooter } from './RowFooter'
import { renderWithClients } from '../../test/render'
import { FakeAuthClient } from '../../test/fakes'
import { createComment, updateComment } from '../../graphql/mutations'
import { SIGN_IN_ERROR_MESSAGE } from '../../hooks/useAuth'

const signedIn = () => { const c = new FakeAuthClient(); c.user = { username: 'u1', displayName: '' }; return c }
const stored = (username: string, siteURL = '') =>
  localStorage.setItem('blogcomment-storedata', JSON.stringify({ username, siteURL, isStored: true }))
const draft = (key: string, text: string) =>
  localStorage.setItem('blogcomment-storedata-comments', JSON.stringify([[key, text]]))

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/posts/post-1')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('RowFooter（未ログイン）', () => {
  it('config で有効なログイン手段のボタンだけ出す（Original/Google/LINE あり、Facebook と GitHub なし）', () => {
    renderWithClients(<RowFooter />)
    expect(screen.getByLabelText('Google SignIn')).toBeInTheDocument()
    expect(screen.getByAltText('Sign in with LINE')).toBeInTheDocument()
    expect(screen.queryByLabelText('Facebook SignIn')).toBeNull()
    expect(screen.queryByLabelText('Github SignIn')).toBeNull()
    expect(screen.queryByText('Send')).toBeNull()
  })
  it('LINE ボタンで signInWithProvider が呼ばれる', async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithClients(<RowFooter />)
    await user.click(screen.getByAltText('Sign in with LINE'))
    await waitFor(() => expect(authClient.calls.some((c) => c.method === 'signInWithProvider' && c.args[0] === 'LINE')).toBe(true))
  })
  it('ログインの呼び出しが失敗したら失敗メッセージを出す', async () => {
    const user = userEvent.setup()
    const authClient = new FakeAuthClient()
    authClient.signInWithProvider = async () => { throw new Error('redirect_uri mismatch') }
    renderWithClients(<RowFooter />, { authClient })
    expect(screen.queryByText(SIGN_IN_ERROR_MESSAGE)).toBeNull()
    await user.click(screen.getByAltText('Sign in with LINE'))
    expect(await screen.findByText(SIGN_IN_ERROR_MESSAGE)).toBeInTheDocument()
  })
})

describe('RowFooter（ログイン済み）', () => {
  it('名前が空なら "Name is empty." を出して送信しない', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<RowFooter />, { authClient: signedIn() })
    await user.click(await screen.findByText('Send'))
    expect(screen.getByText('Name is empty.')).toBeInTheDocument()
    expect(apiClient.mutations).toHaveLength(0)
  })
  it('本文が空なら "comment is empty." を出して送信しない', async () => {
    const user = userEvent.setup()
    stored('alice')
    const { apiClient } = renderWithClients(<RowFooter />, { authClient: signedIn() })
    await user.click(await screen.findByText('Send'))
    expect(screen.getByText('comment is empty.')).toBeInTheDocument()
    expect(apiClient.mutations).toHaveLength(0)
  })
  it('新規投稿は createComment を slug/displayName/content/siteurl 付きで呼ぶ', async () => {
    const user = userEvent.setup()
    stored('alice', 'https://a.com')
    draft('', 'hello **md**')
    const closeEditor = vi.fn()
    const { apiClient } = renderWithClients(<RowFooter closeEditor={closeEditor} />, { authClient: signedIn() })
    await user.click(await screen.findByText('Send'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect(apiClient.mutations[0].query).toBe(createComment)
    expect(apiClient.mutations[0].variables).toEqual({
      input: { content: 'hello **md**', displayName: 'alice', slug: 'post-1', siteurl: 'https://a.com' },
    })
    await waitFor(() => expect(closeEditor).toHaveBeenCalled())
  })
  it('返信は replyTo を付け、Cancel ボタンを出す', async () => {
    const user = userEvent.setup()
    stored('alice')
    draft('c-parent', 'reply body')
    const { apiClient } = renderWithClients(<RowFooter inReplyTo="c-parent" />, { authClient: signedIn() })
    await user.click(await screen.findByText('Send'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect((apiClient.mutations[0].variables as any).input.replyTo).toBe('c-parent')
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
  it('編集は updateComment を id 付きで呼ぶ', async () => {
    const user = userEvent.setup()
    stored('alice')
    draft('blogcomments_edit-c1', 'edited')
    const { apiClient } = renderWithClients(<RowFooter editingCommentId="c1" />, { authClient: signedIn() })
    await user.click(await screen.findByText('Send'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect(apiClient.mutations[0].query).toBe(updateComment)
    expect(apiClient.mutations[0].variables).toEqual({ input: { id: 'c1', content: 'edited', displayName: 'alice' } })
  })
  it('ログイン後に名前が空なら displayName を名前に入れる', async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithClients(<RowFooter />)
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    act(() => authClient.emit({ type: 'signedIn', user: { username: 'u1', displayName: 'Alice' } }))
    await user.click(await screen.findByText('Send'))
    expect(screen.queryByText('Name is empty.')).toBeNull()
    expect(screen.getByText('comment is empty.')).toBeInTheDocument()
  })
  it('サインアウトボタンで signOut を呼ぶ', async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithClients(<RowFooter />, { authClient: signedIn() })
    await user.click(await screen.findByLabelText('SignOut'))
    await waitFor(() => expect(authClient.calls.some((c) => c.method === 'signOut')).toBe(true))
  })
})
