import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useColorScheme } from './useColorScheme'

// jsdom の matchMedia は常に matches=false なので、切り替えられるものに差し替える
let listeners: Array<() => void> = []
const setOsDark = (dark: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
    addEventListener: (_: string, l: () => void) => { listeners.push(l) },
    removeEventListener: (_: string, l: () => void) => { listeners = listeners.filter((x) => x !== l) },
  })) as unknown as typeof window.matchMedia
}
const emitOsChange = () => listeners.forEach((l) => l())

const mountWidgetRoot = () => {
  const el = document.createElement('div')
  el.id = 'blogcomments'
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  listeners = []
  document.getElementById('blogcomments')?.remove()
  setOsDark(false)
})

describe('useColorScheme', () => {
  it('OS がライトなら light、ダークなら dark', () => {
    mountWidgetRoot()
    expect(renderHook(() => useColorScheme()).result.current).toBe('light')
    setOsDark(true)
    expect(renderHook(() => useColorScheme()).result.current).toBe('dark')
  })

  it('OS の変更に追従する', async () => {
    mountWidgetRoot()
    const { result } = renderHook(() => useColorScheme())
    expect(result.current).toBe('light')
    setOsDark(true)
    act(() => emitOsChange())
    expect(result.current).toBe('dark')
  })

  it('data-bc-theme は OS より優先する', () => {
    const root = mountWidgetRoot()
    setOsDark(true)
    root.setAttribute('data-bc-theme', 'light')
    expect(renderHook(() => useColorScheme()).result.current).toBe('light')
    root.setAttribute('data-bc-theme', 'dark')
    setOsDark(false)
    expect(renderHook(() => useColorScheme()).result.current).toBe('dark')
  })

  it('data-bc-theme の書き換えに追従する（ホスト側のトグル）', async () => {
    const root = mountWidgetRoot()
    const { result } = renderHook(() => useColorScheme())
    expect(result.current).toBe('light')
    act(() => root.setAttribute('data-bc-theme', 'dark'))
    await waitFor(() => expect(result.current).toBe('dark'))
    act(() => root.removeAttribute('data-bc-theme'))
    await waitFor(() => expect(result.current).toBe('light'))
  })

  it('#blogcomments が無いページでも落ちない', () => {
    expect(renderHook(() => useColorScheme()).result.current).toBe('light')
  })
})
