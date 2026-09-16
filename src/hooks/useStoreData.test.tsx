import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useStoreData, StoreDataContextProvider } from './useStoreData'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreDataContextProvider>{children}</StoreDataContextProvider>
)

beforeEach(() => localStorage.clear())

describe('useStoreData', () => {
  it('保存すると localStorage に名前と Web が入り isStored が true になる', () => {
    const { result } = renderHook(() => useStoreData(), { wrapper })
    act(() => { result.current.setUsername('alice'); result.current.setSiteURL('https://a.com') })
    act(() => { result.current.saveStoreData() })
    expect(result.current.isStored).toBe(true)
    expect(JSON.parse(localStorage.getItem('blogcomment-storedata')!)).toEqual({
      username: 'alice', siteURL: 'https://a.com', isStored: true,
    })
  })
  it('保存済みデータをマウント時に復元する', () => {
    localStorage.setItem('blogcomment-storedata', JSON.stringify({ username: 'bob', siteURL: 'https://b.com', isStored: true }))
    const { result } = renderHook(() => useStoreData(), { wrapper })
    expect(result.current.username).toBe('bob')
    expect(result.current.siteURL).toBe('https://b.com')
    expect(result.current.isStored).toBe(true)
  })
  it('壊れた JSON でも落ちずに初期値になる', () => {
    localStorage.setItem('blogcomment-storedata', '{broken')
    const { result } = renderHook(() => useStoreData(), { wrapper })
    expect(result.current.username).toBe('')
    expect(result.current.isStored).toBe(false)
  })
  it('removeStoreData で localStorage から消え isStored が false になる', () => {
    localStorage.setItem('blogcomment-storedata', JSON.stringify({ username: 'bob', siteURL: '', isStored: true }))
    const { result } = renderHook(() => useStoreData(), { wrapper })
    act(() => { result.current.removeStoreData() })
    expect(result.current.isStored).toBe(false)
    expect(localStorage.getItem('blogcomment-storedata')).toBeNull()
  })
  it('編集中コメントをキーごとに保存・復元・クリアできる', () => {
    const { result } = renderHook(() => useStoreData(), { wrapper })
    act(() => { result.current.saveEditingComments('reply-1', 'draft') })
    expect(result.current.editingComments.get('reply-1')).toBe('draft')
    expect(JSON.parse(localStorage.getItem('blogcomment-storedata-comments')!)).toEqual([['reply-1', 'draft']])
    act(() => { result.current.clearEditingComments('reply-1') })
    expect(result.current.editingComments.get('reply-1')).toBe('')
  })
  it('編集中コメントをマウント時に復元する', () => {
    localStorage.setItem('blogcomment-storedata-comments', JSON.stringify([['', 'top-level draft']]))
    const { result } = renderHook(() => useStoreData(), { wrapper })
    expect(result.current.editingComments.get('')).toBe('top-level draft')
  })
})
