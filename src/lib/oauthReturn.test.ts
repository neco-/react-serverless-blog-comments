import { describe, it, expect, vi } from 'vitest'
import { FakeAuthClient } from '../test/fakes'
import { startOAuthReturn, OAuthReturnEnv } from './oauthReturn'

const ARTICLE = '/post/why-agile/'

// 既定は「ログイン進行中で、戻り先も復元できる」状態
const makeEnv = (over: Partial<OAuthReturnEnv> = {}): OAuthReturnEnv => ({
  isInFlight: () => true,
  recoverPath: () => ARTICLE,
  reportFailure: vi.fn(),
  dismiss: vi.fn(),
  ...over,
})

// 進行中でない経路は currentUser() を挟むので、マイクロタスクを流す
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('startOAuthReturn', () => {
  it('元の記事パスを受け取ったらそこへ遷移する', () => {
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate, makeEnv())

    authClient.emit({ type: 'customOAuthState', state: ARTICLE })

    expect(navigate).toHaveBeenCalledWith(ARTICLE)
  })

  it('ルートと空文字では遷移しないが、待機表示は畳む', () => {
    const env = makeEnv()
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate, env)

    authClient.emit({ type: 'customOAuthState', state: '/' })

    expect(navigate).not.toHaveBeenCalled()
    expect(env.dismiss).toHaveBeenCalled()
    expect(env.reportFailure).not.toHaveBeenCalled()
  })

  it('ログイン成功やサインアウトでは遷移しない', () => {
    const authClient = new FakeAuthClient()
    const navigate = vi.fn()
    startOAuthReturn(authClient, navigate, makeEnv())

    authClient.emit({ type: 'signedIn', user: { username: 'u', displayName: 'U' } })
    authClient.emit({ type: 'signedOut' })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('遷移したら購読を解除する', () => {
    const authClient = new FakeAuthClient()
    startOAuthReturn(authClient, vi.fn(), makeEnv())
    expect(authClient.listenerCount()).toBe(1)

    authClient.emit({ type: 'customOAuthState', state: ARTICLE })

    expect(authClient.listenerCount()).toBe(0)
  })

  it('戻り値で購読を解除できる', () => {
    const authClient = new FakeAuthClient()
    const stop = startOAuthReturn(authClient, vi.fn(), makeEnv())

    stop()

    expect(authClient.listenerCount()).toBe(0)
  })

  describe('交換に失敗したとき', () => {
    it('URL から復元した記事へ戻し、理由を持ち越す', () => {
      const env = makeEnv()
      const authClient = new FakeAuthClient()
      const navigate = vi.fn()
      startOAuthReturn(authClient, navigate, env)

      authClient.emit({ type: 'signInFailure', error: new Error('invalid_grant') })

      expect(env.reportFailure).toHaveBeenCalledWith('exchange')
      expect(navigate).toHaveBeenCalledWith(ARTICLE)
      expect(authClient.listenerCount()).toBe(0)
    })

    it('戻り先を復元できないときは待機表示を畳む', () => {
      const env = makeEnv({ recoverPath: () => null })
      const authClient = new FakeAuthClient()
      const navigate = vi.fn()
      startOAuthReturn(authClient, navigate, env)

      authClient.emit({ type: 'signInFailure', error: new Error('invalid_grant') })

      expect(navigate).not.toHaveBeenCalled()
      expect(env.dismiss).toHaveBeenCalled()
    })
  })

  describe('ログインが進行中でないとき（交換済みの URL を開き直した場合）', () => {
    it('通知を待たずに記事へ戻し、理由を持ち越す', async () => {
      const env = makeEnv({ isInFlight: () => false })
      const authClient = new FakeAuthClient()
      const navigate = vi.fn()
      startOAuthReturn(authClient, navigate, env)

      await flush()

      expect(env.reportFailure).toHaveBeenCalledWith('no-flow')
      expect(navigate).toHaveBeenCalledWith(ARTICLE)
      expect(authClient.listenerCount()).toBe(0)
    })

    it('既にログインできていれば失敗として扱わずに記事へ戻す', async () => {
      const env = makeEnv({ isInFlight: () => false })
      const authClient = new FakeAuthClient()
      authClient.user = { username: 'u', displayName: 'U' }
      const navigate = vi.fn()
      startOAuthReturn(authClient, navigate, env)

      await flush()

      expect(env.reportFailure).not.toHaveBeenCalled()
      expect(navigate).toHaveBeenCalledWith(ARTICLE)
    })

    it('戻り先を復元できないときは待機表示を畳む', async () => {
      const env = makeEnv({ isInFlight: () => false, recoverPath: () => null })
      const authClient = new FakeAuthClient()
      const navigate = vi.fn()
      startOAuthReturn(authClient, navigate, env)

      await flush()

      expect(navigate).not.toHaveBeenCalled()
      expect(env.dismiss).toHaveBeenCalled()
    })
  })
})
