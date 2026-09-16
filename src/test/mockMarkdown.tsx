import React from 'react'

// Markdown エディタ/プレビュー（ESM・重量級）はテストでは素の要素に置き換える
export const MarkdownPreviewMock = ({ source }: { source: string }) => <div>{source}</div>

// value と各ハンドラは本物と同じように受け渡す（本文のクリアを検証するため）
export const MDEditorMock = ({
  value = '',
  onChange,
  onFocus,
  onBlur,
}: {
  value?: string
  onChange?: (value: string | undefined) => void
  onFocus?: () => void
  onBlur?: () => void
}) => (
  <textarea
    aria-label="comment editor"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    onFocus={onFocus}
    onBlur={onBlur}
  />
)
