import { createContext } from 'react'

const SelectedGroupKeysContext = createContext<React.Key[]>([])

export const Provider = SelectedGroupKeysContext.Provider

const useSelectedGroup = () => {
  const selectedGroupKeys = useContext(SelectedGroupKeysContext)
  return selectedGroupKeys
}

export default useSelectedGroup
