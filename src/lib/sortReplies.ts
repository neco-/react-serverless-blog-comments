// 返信ツリーを updatedAt の降順（新しい順）に並べ替える。
// Gen2 が生成する Comment.replies のリゾルバは replyTo のみをキーにした GSI を使い、
// sortDirection が updatedAt に効かないため、フロント側で並び順を保証する。
type WithReplies = { updatedAt: string; replies?: { items: WithReplies[] } }

export const sortRepliesByUpdatedAtDesc = <T extends WithReplies>(items: T[]): T[] =>
  [...items]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
    .map((item) =>
      item.replies ? { ...item, replies: { ...item.replies, items: sortRepliesByUpdatedAtDesc(item.replies.items) } } : item,
    )
