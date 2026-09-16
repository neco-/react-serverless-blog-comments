import { getSlugFromPathname } from './useSlug'

const setPath = (pathname: string) => {
  window.history.pushState({}, '', pathname)
}

describe('getSlugFromPathname', () => {
  it('ルートは "/" を返す', () => {
    setPath('/')
    expect(getSlugFromPathname()).toBe('/')
  })
  it('末尾のパスセグメントを返す', () => {
    setPath('/posts/hello-world')
    expect(getSlugFromPathname()).toBe('hello-world')
  })
  it('末尾スラッシュを無視する', () => {
    setPath('/posts/hello-world/')
    expect(getSlugFromPathname()).toBe('hello-world')
  })
  it('1 階層でも末尾セグメントを返す', () => {
    setPath('/about')
    expect(getSlugFromPathname()).toBe('about')
  })
})
