import React from "react"

import { RowHeader } from './RowHeader'
import { RowInputName } from './RowInputName'
import { RowInputSiteURL } from './RowInputSiteURL'
import { RowEditor } from './RowEditor'
import { RowFooter } from './RowFooter'
import { IS_SHOW_SIGNATURE } from '../../config'

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
    <RowHeader isReply={!!inReplyTo} isEditing={!!editingCommentId} isShownSign={IS_SHOW_SIGNATURE} />
    <RowInputName />
    <RowInputSiteURL />
    <RowEditor inReplyTo={inReplyTo} editingCommentId={editingCommentId} editingComment={editingComment} />
    <RowFooter inReplyTo={inReplyTo} editingCommentId={editingCommentId} closeEditor={closeEditor}/>
    </>
  )
}
