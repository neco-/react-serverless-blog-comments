import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { navigateTo, dismissOAuthReturnDialog } from './navigation'

describe('navigateTo', () => {
  it('復帰 URL のクエリを残さずに記事へ移す（使用済みの code を持ち回らない）', () => {
    const assign = vi.fn()
    // jsdom の location は差し替えられないので、呼び出しだけを見る
    vi.stubGlobal('location', { ...window.location, assign } as unknown as Location)

    navigateTo('/post/why-agile/')

    expect(assign).toHaveBeenCalledWith('/post/why-agile/')
    vi.unstubAllGlobals()
  })
})

describe('dismissOAuthReturnDialog', () => {
  it('ホストのページが受け取れる合図を出す', () => {
    const listener = vi.fn()
    window.addEventListener('blogcomments:oauth-return-done', listener)

    dismissOAuthReturnDialog()

    expect(listener).toHaveBeenCalled()
    window.removeEventListener('blogcomments:oauth-return-done', listener)
  })
})
