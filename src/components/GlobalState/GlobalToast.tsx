import { toast as sonnerToast } from 'sonner'
import { Button } from 'antd'
import mitt from 'mitt'

export const globalToastEmitter = mitt<{ notify: ToastProps }>()

/** 全局通知弹窗组件 */
const GlobalToast: React.FC = () => {
  useEffect(() => {
    const fn = (toastProps: ToastProps) => {
      toast(toastProps)
    }

    globalToastEmitter.on('notify', fn)
    return () => {
      globalToastEmitter.off('notify', fn)
    }
  }, [])

  return null
}

function toast(toast: ToastProps) {
  return sonnerToast.custom(
    (id) => (
      <Toast
        id={toast.id ?? id}
        title={toast.title}
        description={toast.description}
        button={{
          label: toast.button?.label,
          onClick: toast.button?.onClick,
        }}
      />
    ),
    { duration: Infinity, id: toast.id },
  )
}

interface ToastProps {
  id?: string | number
  title: ReactNode
  description: ReactNode
  button?: {
    label: ReactNode
    onClick?: () => void
  }
}

function Toast(props: ToastProps) {
  const { title, description, button, id } = props

  return (
    <div className="flex rounded bg-[#16202be6] shadow-lg ring-1 ring-ground-1 w-[350px] backdrop-blur-sm items-center p-3 gap-3">
      <div className="flex flex-1 items-center">
        <div className="w-full">
          {title}
          <div className="mt-1 text-sm">{description}</div>
        </div>
      </div>
      <div>
        {button && (
          <Button
            size="small"
            onClick={() => {
              button.onClick?.()
              sonnerToast.dismiss(id)
            }}
          >
            {button.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export default GlobalToast
