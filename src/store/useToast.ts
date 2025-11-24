import { type ToastT } from 'sonner'
import { create } from 'zustand'

type StateType = {
  toasts: ToastT[]
}

type ActionType = {
  setToasts: (toasts: ToastT[]) => void
}

const useToastStore = create<StateType & ActionType>()((set) => ({
  toasts: [],
  setToasts: (toasts) => set({ toasts }),
}))

export default useToastStore

export const useCurrentToasts = () => useToastStore((s) => s.toasts)
