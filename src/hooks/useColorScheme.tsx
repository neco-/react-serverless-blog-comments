import { useEffect, useState } from 'react'

import { getWidgetRoot } from '../lib/widgetRoot'

export type ColorScheme = 'light' | 'dark'

// 埋め込む側が明暗を強制するための属性。独自のテーマ切替を持つホスト向けの逃げ道で、
// OS の設定より優先する。付いていなければ prefers-color-scheme に追従する。
export const FORCED_THEME_ATTRIBUTE = 'data-bc-theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

const readColorScheme = (): ColorScheme => {
  const forced = getWidgetRoot().getAttribute(FORCED_THEME_ATTRIBUTE)
  if (forced === 'dark' || forced === 'light') return forced
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

/*
 * CSS は prefers-color-scheme と data-bc-theme で切り替わるが、Markdown エディタと
 * プレビューは data-color-mode 属性で配色を決める作りなので、CSS だけでは追従できない。
 * ここで現在の明暗を求めて属性に渡す。
 */
export const useColorScheme = (): ColorScheme => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(readColorScheme)

  useEffect(() => {
    const update = () => setColorScheme(readColorScheme())
    update()

    const query = window.matchMedia?.(DARK_QUERY)
    query?.addEventListener('change', update)

    // ホストが属性を書き換えた瞬間にも追従する
    const observer = new MutationObserver(update)
    observer.observe(getWidgetRoot(), { attributes: true, attributeFilter: [FORCED_THEME_ATTRIBUTE] })

    return () => {
      query?.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [])

  return colorScheme
}
