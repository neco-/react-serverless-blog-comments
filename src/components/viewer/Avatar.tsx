import React, { memo } from 'react'

import Badge from 'react-bootstrap/Badge'

type AvatarProps = {
  name: string
}

const bgColors = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'dark',
]

const getFirstChar = (name: string) => {
  const isVariationSelector = (codePoint: number) => {
    const VARIATION_SELECTOR_START = 0xFE00
    const VARIATION_SELECTOR_END = 0xFE0F
    return codePoint >= VARIATION_SELECTOR_START && codePoint <= VARIATION_SELECTOR_END
  }

  // Array.fromでUnicodeとしてCodePoint単位で1文字として扱う
  const chars = Array.from(name)
  const n = chars.length
  const xs = [chars[0]]

  let i = 0
  while (i < n - 1) {
    const ZWJ = 0x200D
    const nextCodePoint = chars[i + 1].codePointAt(0)
    // ZWJ絵文字
    if (nextCodePoint === ZWJ) {
      xs.push(chars[++i])
      xs.push(chars[++i])
    // Variation Selector
    } else if (nextCodePoint && isVariationSelector(nextCodePoint)) {
      xs.push(chars[++i])
    } else {
      break
    }
  }

  return xs.join('').toUpperCase()
}

export const Avatar = memo(({name}: AvatarProps) => {
  const initial = getFirstChar(name)
  const bgColor = bgColors[initial.charCodeAt(0) % bgColors.length]

  return (
    <Badge
      bg={bgColor}
      text="white"
      className="me-2"
      style={{
        width: "2.0em",
        height: "2.0em",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      }}>
      {initial}
    </Badge>
  )
})
