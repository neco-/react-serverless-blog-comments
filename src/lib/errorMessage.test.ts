import { describe, it, expect } from 'vitest'
import { errorMessage } from './errorMessage'

describe('errorMessage', () => {
  it('印の付いたメッセージは中身だけを返す（GraphQL の errors 形）', () => {
    const err = { errors: [{ message: 'UserError: Comment not found.' }] }
    expect(errorMessage(err, 'fallback')).toBe('Comment not found.')
  })
  it('Error として届いても同じように取り出す', () => {
    expect(errorMessage(new Error('UserError: content is required.'), 'fallback'))
      .toBe('content is required.')
  })
  it('印の無いエラーは中身を出さず fallback を返す', () => {
    const err = { errors: [{ message: 'ConditionalCheckFailedException:The conditional request failed' }] }
    expect(errorMessage(err, 'fallback')).toBe('fallback')
  })
  it('メッセージを持たないものも fallback を返す', () => {
    expect(errorMessage(undefined, 'fallback')).toBe('fallback')
    expect(errorMessage({}, 'fallback')).toBe('fallback')
  })
})
