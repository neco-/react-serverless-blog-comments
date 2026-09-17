import { describe, it, expect } from 'vitest'
import { recoverPathFromState } from './oauthState'

// Amplify は state を `<乱数>-<パスの16進>` の形で作る
const hex = (s: string) => [...s].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
const state = (path: string) => 'a'.repeat(32) + '-' + hex(path)

describe('recoverPathFromState', () => {
  it('state から元の記事パスを復元する', () => {
    expect(recoverPathFromState('?code=X&state=' + state('/post/why-agile/'))).toBe('/post/why-agile/')
  })

  it('パスに - が含まれていても復元できる', () => {
    expect(recoverPathFromState('?state=' + state('/post/why-agile-told-negatively/')))
      .toBe('/post/why-agile-told-negatively/')
  })

  it('state が無ければ null', () => {
    expect(recoverPathFromState('?code=X')).toBeNull()
    expect(recoverPathFromState('')).toBeNull()
  })

  it('customState を含まない state（- が無い）は null', () => {
    expect(recoverPathFromState('?state=' + 'a'.repeat(32))).toBeNull()
  })

  it('16進として壊れている、または空なら null', () => {
    expect(recoverPathFromState('?state=aaaa-zzzz')).toBeNull()
    expect(recoverPathFromState('?state=aaaa-')).toBeNull()
  })

  it('サイト内の絶対パス以外は受け付けない（別サイトへ飛ばさないため）', () => {
    expect(recoverPathFromState('?state=' + state('//evil.example.com/'))).toBeNull()
    expect(recoverPathFromState('?state=' + state('https://evil.example.com/'))).toBeNull()
    expect(recoverPathFromState('?state=' + state('post/x/'))).toBeNull()
  })

  it('ルートは戻り先にならない（復帰ページ自身のため）', () => {
    expect(recoverPathFromState('?state=' + state('/'))).toBeNull()
  })
})
