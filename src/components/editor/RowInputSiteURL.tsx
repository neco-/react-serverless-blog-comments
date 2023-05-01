import React from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import InputGroup from "react-bootstrap/InputGroup"
import Form from "react-bootstrap/Form"

import { useStoreData } from "../../hooks/useStoreData"

export const RowInputSiteURL = () => {
  const { siteURL, setSiteURL } = useStoreData()

  const handleChangeSiteURL = (e: React.ChangeEvent<HTMLInputElement>) => setSiteURL(e.target.value)

  return (
    <Row>
    <Col className="p-0">
      <InputGroup size="sm">
        <InputGroup.Text id="blogcomment-comment-igt-siteurl">Web(Optional):</InputGroup.Text>
        <Form.Control
          id="blogcomment-comment-fc-siteurl"
          defaultValue={siteURL}
          placeholder="https://"
          aria-label="SiteURL"
          onChange={handleChangeSiteURL}
        />
      </InputGroup>
    </Col>
    </Row>
  )
}
