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
      {/* label はすぐ上の 2 つの入力欄（Name / Web(Optional)）を指す。「Save」だと
          サーバーへ送ると読める余地があるので、ブラウザに残ることが伝わる
          「Remember」にする。欄の名前をそのまま「/」で並べるのは、散文の
          「and Web」より何が残るのか読み取りやすく、狭い画面で「Name/」の後ろで
          きれいに折り返せるため */}
      <Form.Check
        style={{fontWeight:500}}
        type="checkbox"
        id="blogcomment-comment-form-checkbox-savedata"
        label="Remember Name/Web"
        checked={isStored}
        onChange={handleChangeIsStored}
      />
    </Form>
  )
}
