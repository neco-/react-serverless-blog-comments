import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, AuthContextProvider, SIGN_IN_ERROR_MESSAGE } from './useAuth'
import { ClientsProvider } from '../lib/clients'
import { FakeAuthClient, FakeApiClient } from '../test/fakes'
import { navigateTo } from '../lib/navigation'

vi.mock('../lib/navigation', () => ({ navigateTo: vi.fn() }))

const setup = (authClient = new FakeAuthClient()) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClientsProvider authClient={authClient} apiClient={new FakeApiClient()}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </ClientsProvider>
  )
  return { authClient, ...renderHook(() => useAuth(), { wrapper }) }
}

beforeEach(() => {
  vi.mocked(navigateTo).mockClear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('useAuth', () => {
  it('マウント時にログイン済みなら isAuthenticated=true、displayName は空', async () => {
    const c = new FakeAuthClient()
    c.user = { username: 'u1', displayName: 'ignored' }
    const { result } = setup(c)
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.username).toBe('u1')
    expect(result.current.displayName).toBe('')
  })
  it('未ログインなら isAuthenticated=false で isError=true', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isAuthenticated).toBe(false)
  })
  it('signedIn イベントで username と displayName が入る', async () => {
    const { result, authClient } = setup()
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    act(() => authClient.emit({ type: 'signedIn', user: { username: 'u2', displayName: 'Alice' } }))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.displayName).toBe('Alice')
    expect(result.current.isError).toBe(false)
  })
  it('signInFailure で isError=true、signedOut で未ログインに戻る', async () => {
    const { result, authClient } = setup()
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    act(() => authClient.emit({ type: 'signInFailure', error: 'x' }))
    expect(result.current.isError).toBe(true)
    act(() => authClient.emit({ type: 'signedIn', user: { username: 'u', displayName: 'U' } }))
    act(() => authClient.emit({ type: 'signedOut' }))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.username).toBe('')
  })
  it('customOAuthState で元のパスへ遷移する（"/" と空は何もしない）', async () => {
    const { authClient } = setup()
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    act(() => authClient.emit({ type: 'customOAuthState', state: '/' }))
    act(() => authClient.emit({ type: 'customOAuthState', state: '' }))
    expect(navigateTo).not.toHaveBeenCalled()
    act(() => authClient.emit({ type: 'customOAuthState', state: '/posts/x' }))
    expect(navigateTo).toHaveBeenCalledWith('/posts/x')
  })
  it('signIn はクライアントに username と password を渡す', async () => {
    const { result, authClient } = setup()
    await act(async () => { await result.current.signIn('user', 'pass') })
    expect(authClient.calls).toContainEqual({ method: 'signIn', args: ['user', 'pass'] })
  })
  it('signIn が失敗したら isError=true', async () => {
    const c = new FakeAuthClient()
    c.signIn = async () => { throw new Error('bad password') }
    const { result } = setup(c)
    await act(async () => { await result.current.signIn('user', 'pass') })
    expect(result.current.isError).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })
  it('OAuth プロバイダの呼び出しが失敗したらメッセージが入る', async () => {
    const c = new FakeAuthClient()
    c.signInWithProvider = async () => { throw new Error('redirect_uri mismatch') }
    const { result } = setup(c)
    await act(async () => { await result.current.signInWithGoogle() })
    expect(result.current.signInErrorMessage).toBe(SIGN_IN_ERROR_MESSAGE)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(true)
  })
  it('OAuth プロバイダの呼び出しが成功したらメッセージは空のまま', async () => {
    const { result } = setup()
    await act(async () => { await result.current.signInWithLine() })
    expect(result.current.signInErrorMessage).toBe('')
  })
  it('signInFailure イベントでもメッセージが入り、signedIn で消える', async () => {
    const { result, authClient } = setup()
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    act(() => authClient.emit({ type: 'signInFailure', error: 'x' }))
    expect(result.current.signInErrorMessage).toBe(SIGN_IN_ERROR_MESSAGE)
    act(() => authClient.emit({ type: 'signedIn', user: { username: 'u', displayName: 'U' } }))
    expect(result.current.signInErrorMessage).toBe('')
  })
  it('未ログインなだけではメッセージを出さない', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.signInErrorMessage).toBe('')
  })
  it('signOut はクライアントの signOut を呼ぶ', async () => {
    const { result, authClient } = setup()
    await act(async () => { await result.current.signOut() })
    expect(authClient.calls).toContainEqual({ method: 'signOut', args: [] })
  })
  it('各 OAuth は現在のパスを customState として渡す', async () => {
    window.history.pushState({}, '', '/posts/abc')
    const { result, authClient } = setup()
    await act(async () => { await result.current.signInWithGoogle() })
    await act(async () => { await result.current.signInWithFacebook() })
    await act(async () => { await result.current.signInWithLine() })
    expect(authClient.calls.filter((c) => c.method === 'signInWithProvider').map((c) => c.args)).toEqual([
      ['Google', '/posts/abc'], ['Facebook', '/posts/abc'], ['LINE', '/posts/abc'],
    ])
  })
  it('アンマウントで listener が解除される', async () => {
    const { authClient, unmount } = setup()
    await waitFor(() => expect(authClient.listenerCount()).toBe(1))
    unmount()
    expect(authClient.listenerCount()).toBe(0)
  })
})
