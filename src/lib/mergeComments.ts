// subscription で届いたコメントを、手元のツリーに反映する。
//
// 以前は通知を受けるたびに全件を取り直していた。同時に見ている人が多いほど
// AppSync と DynamoDB の読み取りが増えるため、届いた内容をそのまま当てる。
//
// 当てられないとき（親が手元に無い、対象が見つからない）は null を返す。
// 呼び出し側は取り直しにフォールバックする。取りこぼすより一度多く読むほうがよい。

export type MergeableComment = {
  id: string
  replyTo?: string | null
  replies?: { items: MergeableComment[] }
}

const findById = <T extends MergeableComment>(items: T[], id: string): boolean =>
  items.some((item) => item.id === id || findById((item.replies?.items ?? []) as T[], id))

// 親を探して、その replies の先頭に足す。見つからなければ found = false。
const insertUnder = <T extends MergeableComment>(
  items: T[],
  parentId: string,
  child: T,
): { items: T[]; found: boolean } => {
  let found = false
  const next = items.map((item) => {
    if (found) return item
    if (item.id === parentId) {
      found = true
      const replies = item.replies ?? { items: [] }
      return { ...item, replies: { ...replies, items: [child, ...replies.items] } }
    }
    if (!item.replies) return item
    const result = insertUnder(item.replies.items as T[], parentId, child)
    if (!result.found) return item
    found = true
    return { ...item, replies: { ...item.replies, items: result.items } }
  })
  return { items: next, found }
}

// id が一致する要素にスカラー項目を当てる。replies は手元のものを残す
// （届いた側の replies は、手元で先に反映済みの返信を落としうるため）。
const replaceById = <T extends MergeableComment>(
  items: T[],
  changed: T,
): { items: T[]; found: boolean } => {
  let found = false
  const next = items.map((item) => {
    if (found) return item
    if (item.id === changed.id) {
      found = true
      return { ...item, ...changed, replies: item.replies ?? changed.replies }
    }
    if (!item.replies) return item
    const result = replaceById(item.replies.items as T[], changed)
    if (!result.found) return item
    found = true
    return { ...item, replies: { ...item.replies, items: result.items } }
  })
  return { items: next, found }
}

// 新規投稿 / 返信投稿。既に手元にあれば何もしない（同じ通知が二度来ても増やさない）。
export const applyCreated = <T extends MergeableComment>(items: T[], created: T): T[] | null => {
  if (findById(items, created.id)) return items
  if (!created.replyTo) return [created, ...items]
  const { items: next, found } = insertUnder(items, created.replyTo, created)
  return found ? next : null
}

// 編集 / 削除。削除は内容を伏せるだけの更新なので同じ扱い。
export const applyChanged = <T extends MergeableComment>(items: T[], changed: T): T[] | null => {
  const { items: next, found } = replaceById(items, changed)
  return found ? next : null
}
