import React from "react"

import { RowHeader } from './RowHeader'
import { RowInputName } from './RowInputName'
import { RowInputSiteURL } from './RowInputSiteURL'
import { RowEditor } from './RowEditor'
import { RowFooter } from './RowFooter'

export const Editor = ({
    inReplyTo = "",
    editingCommentId = "",
    editingComment = "",
    closeEditor=() => {},
  }: {
    inReplyTo?: string,
    editingCommentId?: string,
    editingComment?: string,
    closeEditor?: () => void,
  }) => {
  return (
    <>
    <RowHeader isReply={!!inReplyTo} isEditing={!!editingCommentId} />
    <RowInputName />
    <RowInputSiteURL />
    <RowEditor inReplyTo={inReplyTo} editingCommentId={editingCommentId} editingComment={editingComment} />
    <RowFooter inReplyTo={inReplyTo} editingCommentId={editingCommentId} closeEditor={closeEditor}/>
    </>
  )
}
