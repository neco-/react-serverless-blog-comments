import React from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import InputGroup from "react-bootstrap/InputGroup"
import Form from "react-bootstrap/Form"

import { useStoreData } from "../../hooks/useStoreData"

export const RowInputName = () => {
  const { username, setUsername } = useStoreData()

  const handleChangeDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)

  return (
    <Row>
    <Col className="p-0">
      <InputGroup size="sm">
        <InputGroup.Text id="blogcomment-comment-igt-username">Name<div style={{color: "red"}}>*</div>:</InputGroup.Text>
        <Form.Control
          id="blogcomment-comment-fc-username"
          placeholder="Your name"
          aria-label="displayName"
          defaultValue={username}
          onChange={handleChangeDisplayName}
        />
      </InputGroup>
    </Col>
    </Row>
  )
}
