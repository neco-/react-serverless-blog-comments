import { describe, it, expect, beforeEach } from 'vitest'
import { reportOAuthFailure, consumeOAuthFailure, oauthFailureMessage } from './oauthFailure'

beforeEach(() => sessionStorage.clear())

describe('OAuth の失敗の持ち越し', () => {
  it('記録した理由を記事ページ側で受け取れる', () => {
    reportOAuthFailure('exchange')
    expect(consumeOAuthFailure()).toBe('exchange')
  })

  it('一度受け取ったら消える（再訪で古い失敗を出さないため）', () => {
    reportOAuthFailure('no-flow')
    consumeOAuthFailure()
    expect(consumeOAuthFailure()).toBeNull()
  })

  it('何も記録が無ければ null', () => {
    expect(consumeOAuthFailure()).toBeNull()
  })

  it('知らない値が入っていても null（壊れた保存内容に引きずられない）', () => {
    sessionStorage.setItem('blogcomment-oauth-failure', 'nonsense')
    expect(consumeOAuthFailure()).toBeNull()
  })

  it('画面に出す文言には理由コードが入る（コンソールを見られない端末のため）', () => {
    expect(oauthFailureMessage('exchange')).toContain('exchange')
    expect(oauthFailureMessage('no-flow')).toContain('no-flow')
  })
})
