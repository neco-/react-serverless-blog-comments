import React from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import { POWERED_BY_LABEL, POWERED_BY_URL } from "../../config"

export const RowHeader = ({
    isEditing = false,
    isReply = false,
  } : {
    isEditing?: boolean,
    isReply: boolean
  }) => {
  return (
    <Row>
      <div className="mb-1 ps-0" style={{display:"flex", alignItems:"end"}}>
      <Col>
        <div style={{fontSize:"large", fontWeight:"bold"}}>
          {isEditing ? "Edit" : isReply ? "Reply" : "Comments"}
        </div>
      </Col>
      <Col>
        {POWERED_BY_LABEL && POWERED_BY_URL
          ? <div style={{display:"flex", justifyContent:"right", fontSize:"x-small"}}><a href={POWERED_BY_URL} target="_blank" rel="noopener noreferrer">{POWERED_BY_LABEL}</a></div>
          : null
        }
      </Col>
      </div>
    </Row>
  )
}
