import { useState, useEffect } from 'react'

export const getSlugFromPathname = () => {
  const pathname: string = window.location.pathname
  if (pathname === "/") {
    return "/"
  } else if (pathname.includes("/")) {
    const segments: string[] = pathname.split("/").filter(segment => segment !== "")
    return segments[segments.length - 1]
  } else if (pathname.length > 0) {
    return pathname
  }
  return "noslug"
}

export const useSlug = () => {
  const [slug, setSlug] = useState("")

  useEffect(() => {
    setSlug(getSlugFromPathname())
  }, [])

  return {
    slug
  }
}
