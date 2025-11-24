import useToastStore from '@/store/useToast'
import { Toaster, useSonner } from 'sonner'

type PropsType = unknown

const Toast: FC<PropsType> = memo(() => {
  const toast = useMemo(
    () => (
      <Toaster
        position="top-right"
        offset={{
          top: '50px',
          right: '54px',
        }}
        style={{
          zIndex: 1000,
        }}
        gap={12}
      />
    ),
    [],
  )

  const { toasts } = useSonner()

  useEffect(() => {
    useToastStore.getState().setToasts(toasts)
  }, [toasts])

  return toast
})

Toast.displayName = 'Toast'

export default Toast
