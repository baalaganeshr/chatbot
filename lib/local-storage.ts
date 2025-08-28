export const getFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }
  return null
}

export const setInLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export const removeFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key)
  }
}
