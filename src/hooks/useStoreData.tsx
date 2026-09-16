import React, { useState, useEffect, useContext, createContext } from 'react'

interface IStoreData {
  username: string
  siteURL: string
  isStored: boolean
  editingComments: Map<string, string>
  setUsername: React.Dispatch<React.SetStateAction<string>>
  setSiteURL: React.Dispatch<React.SetStateAction<string>>
  saveStoreData: () => void
  removeStoreData: () => void
  saveEditingComments: (inReplyTo: string, comment: string) => void
  clearEditingComments: (inReplyTo: string) => void
  removeEditingComments: () => void
}

const StoreDataContext = createContext({} as IStoreData)

export const useStoreData = () => useContext(StoreDataContext)

export const StoreDataContextProvider = ({children}: any) => {
  return <StoreDataContext.Provider value={InternalStoreData()}>{children}</StoreDataContext.Provider>
}

const InternalStoreData = (): IStoreData => {
  const LOCAL_STORAGE_STOREDATA = "blogcomment-storedata"
  const LOCAL_STORAGE_STOREDATA_COMMENTS = "blogcomment-storedata-comments"
  const [username, setUsername] = useState<string>("")
  const [siteURL, setSiteURL] = useState<string>("")
  const [isStored, setIsStored] = useState<boolean>(false)

  const [editingComments, setEditingComments] = useState<Map<string, string>>(new Map<string, string>())

  useEffect(() => {
    console.log("useStoreData Hook")
    const inner = async () => {
      // common
      try {
        const storeData = localStorage.getItem(LOCAL_STORAGE_STOREDATA)
        if (storeData) {
          const { username, siteURL, isStored } = JSON.parse(storeData)
          setUsername(username)
          setSiteURL(siteURL)
          setIsStored(isStored)
        }
      } catch(error) {
        setUsername("")
        setSiteURL("")
        setIsStored(false)
      }

      // restore previous editing comments
      try {
        const storeData = localStorage.getItem(LOCAL_STORAGE_STOREDATA_COMMENTS)
        if (storeData) {
          setEditingComments(new Map<string, string>(JSON.parse(storeData)))
        }
      } catch(error) {
        console.error(error)
        setEditingComments(new Map<string, string>())
      }
    }
    inner()
  }, [])

  const saveStoreData = () => {
    localStorage.setItem(
      LOCAL_STORAGE_STOREDATA,
      JSON.stringify({
        username,
        siteURL,
        isStored: true
      })
    )
    setUsername(username)
    setSiteURL(siteURL)
    setIsStored(true)
  }
  const removeStoreData = () => {
    localStorage.removeItem(LOCAL_STORAGE_STOREDATA)
    setIsStored(false)
  }

  const saveEditingComments = (inReplyTo: string = "", comment: string = "") => {
    editingComments.set(inReplyTo, comment)
    // create new object to trigger RowEditor's useEffect
    setEditingComments(new Map(editingComments))
    localStorage.setItem(
      LOCAL_STORAGE_STOREDATA_COMMENTS,
      JSON.stringify(Array.from(editingComments.entries()))
    )
  }
  const clearEditingComments = (inReplyTo: string = "") => {
    editingComments.set(inReplyTo, "")
    // create new object to trigger RowEditor's useEffect
    setEditingComments(new Map(editingComments))
    localStorage.setItem(
      LOCAL_STORAGE_STOREDATA_COMMENTS,
      JSON.stringify(Array.from(editingComments.entries()))
    )
  }
  const removeEditingComments = () => {
    localStorage.removeItem(LOCAL_STORAGE_STOREDATA_COMMENTS)
  }

  return {
    username,
    siteURL,
    isStored,
    setUsername,
    setSiteURL,
    editingComments,
    saveStoreData,
    removeStoreData,
    saveEditingComments,
    clearEditingComments,
    removeEditingComments,
  }
}
