import { getFirstChar } from './Avatar'

describe('getFirstChar', () => {
  it('先頭 1 文字を大文字にする', () => {
    expect(getFirstChar('alice')).toBe('A')
  })
  it('日本語は先頭 1 文字', () => {
    expect(getFirstChar('太郎')).toBe('太')
  })
  it('ZWJ 絵文字はまとめて 1 文字', () => {
    expect(getFirstChar('👨‍👩‍👧x')).toBe('👨‍👩‍👧')
  })
  it('異体字セレクタを含めて 1 文字', () => {
    expect(getFirstChar('❤️x')).toBe('❤️')
  })
})
