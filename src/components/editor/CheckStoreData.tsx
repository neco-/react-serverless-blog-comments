import React from "react"

import Form from "react-bootstrap/Form"

import { useStoreData } from "../../hooks/useStoreData"

export const CheckStoreData = () => {
  const { isStored, saveStoreData, removeStoreData } = useStoreData()

  const handleChangeIsStored = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      saveStoreData()
    } else {
      removeStoreData()
    }
  }

  return (
    <Form className="bc-savedata">
      <Form.Check
        style={{fontWeight:500}}
        type="checkbox"
        id="blogcomment-comment-form-checkbox-savedata"
        label="Save Name and Web"
        checked={isStored}
        onChange={handleChangeIsStored}
      />
    </Form>
  )
}
