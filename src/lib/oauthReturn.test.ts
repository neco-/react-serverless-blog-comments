import { describe, it, expect, vi } from 'vitest'
import { FakeAuthClient } from '../test/fakes'
import { startOAuthReturn } from './oauthReturn'

describe('startOAuthReturn', () => {
  it('元の記事パスを受け取ったらそこへ遷移する', () => {
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate)

    authClient.emit({ type: 'customOAuthState', state: '/post/why-agile/' })

    expect(navigate).toHaveBeenCalledWith('/post/why-agile/')
  })

  it('ルートと空文字では遷移しない（既にその位置にいるため）', () => {
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate)

    authClient.emit({ type: 'customOAuthState', state: '/' })
    authClient.emit({ type: 'customOAuthState', state: '' })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('ログイン成功やサインアウトでは遷移しない', () => {
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate)

    authClient.emit({ type: 'signedIn', user: { username: 'u', displayName: 'U' } })
    authClient.emit({ type: 'signedOut' })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('遷移したら購読を解除する', () => {
    const authClient = new FakeAuthClient()
    startOAuthReturn(authClient, vi.fn())
    expect(authClient.listenerCount()).toBe(1)

    authClient.emit({ type: 'customOAuthState', state: '/post/x/' })

    expect(authClient.listenerCount()).toBe(0)
  })

  it('戻り値で購読を解除できる', () => {
    const authClient = new FakeAuthClient()
    const stop = startOAuthReturn(authClient, vi.fn())

    stop()

    expect(authClient.listenerCount()).toBe(0)
  })
})
