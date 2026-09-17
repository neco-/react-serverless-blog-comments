import React, { useEffect, useRef, useState } from 'react'

// 確認の帯が伸び縮みする時間。CSS の bc-confirm-grow / bc-confirm-shrink と揃える
export const CONFIRM_ANIMATION_MS = 300

export type ConfirmPhase = 'closed' | 'open' | 'closing'

// 取り消せない操作（削除・ログアウト）の前に、その場で確定を求める帯。
// 開く・閉じる途中を state に持ち、閉じ切りは CSS の animationend で拾う。
// animationend が来ない環境（動きを減らす設定、テスト）でも必ず閉じるよう
// 時間切れの保険を置く
export const useConfirmBand = () => {
  const [phase, setPhase] = useState<ConfirmPhase>('closed')
  const closeTimer = useRef<number | undefined>(undefined)

  const finishClosing = () => {
    window.clearTimeout(closeTimer.current)
    setPhase('closed')
  }
  const startClosing = () => {
    setPhase('closing')
    closeTimer.current = window.setTimeout(finishClosing, CONFIRM_ANIMATION_MS + 50)
  }
  const open = () => setPhase('open')

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // 帯そのものに付ける属性。閉じ方（animationend と Escape）を 2 箇所に書き写さない。
  // modifier は用途ごとの見た目（bc-confirm-delete / bc-confirm-signout）
  const bandProps = (modifier: string) => ({
    className: 'bc-confirm ' + modifier + (phase === 'closing' ? ' bc-closing' : ''),
    // 閉じている途中は押せなくする。disabled だと .btn:disabled の opacity で
    // 帯が透けて下のボタンが見えるので、見た目を変えない inert を使う
    inert: phase === 'closing' || undefined,
    onAnimationEnd: () => { if (phase === 'closing') finishClosing() },
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Escape') startClosing() },
  })

  // 帯の下に残る通常のボタン列に付ける属性。確認中は押せなくする
  const coveredProps = { inert: phase !== 'closed' || undefined }

  // close は確定したときに使う。縮む動きを見せずにその場で閉じる
  return { isOpen: phase !== 'closed', open, close: finishClosing, startClosing, bandProps, coveredProps }
}
