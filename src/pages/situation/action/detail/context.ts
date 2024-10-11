import { createContext } from 'react'

const context = createContext<API_ACTION.domain.ActionDetail | null>(null)

export const { Provider, Consumer } = context

const useActionDetail = () => {
  return useContext(context)
}

export default useActionDetail
