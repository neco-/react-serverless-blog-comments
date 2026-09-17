import { describe, it, expect, beforeEach } from 'vitest'
import { rememberSignOutReturn, SIGNOUT_RETURN_KEY } from './signOutReturn'

beforeEach(() => sessionStorage.clear())

const stored = () => {
  const raw = sessionStorage.getItem(SIGNOUT_RETURN_KEY)
  return raw ? JSON.parse(raw) : null
}

describe('rememberSignOutReturn', () => {
  it('記事のパスと時刻を預ける', () => {
    const before = Date.now()
    rememberSignOutReturn('/post/why-agile/')
    const r = stored()
    expect(r.path).toBe('/post/why-agile/')
    expect(r.at).toBeGreaterThanOrEqual(before)
  })

  it('ルートは預けない（ログアウトの着地点そのものなので戻る必要がない）', () => {
    rememberSignOutReturn('/')
    expect(stored()).toBeNull()
  })

  it('サイト内の絶対パス以外は預けない（別サイトへ飛ばさないため）', () => {
    rememberSignOutReturn('//evil.example.com/')
    rememberSignOutReturn('https://evil.example.com/')
    rememberSignOutReturn('post/x/')
    expect(stored()).toBeNull()
  })
})
