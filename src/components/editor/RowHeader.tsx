import React from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

export const RowHeader = ({
    isShownSign = true,
    isEditing = false,
    isReply = false,
  } : {
    isShownSign: boolean,
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
        {isShownSign
          ? <div style={{display:"flex", justifyContent:"right", fontSize:"x-small"}}><a href="https://scrum-cjgg.com" target="_blank" rel="noopener noreferrer">Powered by scrum-cjgg</a></div>
          : null
        }
      </Col>
      </div>
    </Row>
  )
}
