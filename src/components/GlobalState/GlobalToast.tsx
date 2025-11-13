import { toast as sonnerToast } from 'sonner'
import { Button, Dropdown, GetProps } from 'antd'
import mitt from 'mitt'
import { CaretDownOutlined } from '@ant-design/icons'

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
        menu={toast.menu}
      />
    ),
    { duration: Infinity, id: toast.id },
  )
}

interface ToastProps {
  id?: string | number
  title: ReactNode
  description: ReactNode
  menu?: GetProps<typeof Dropdown>['menu']
}

function Toast(props: ToastProps) {
  const { title, description, menu } = props
  const { t } = useTranslation()

  return (
    <div className="flex rounded bg-[#16202be6] shadow-lg ring-1 ring-ground-1 w-[350px] backdrop-blur-sm items-center p-3 gap-3 z-10">
      <div className="flex flex-1 items-center">
        <div className="w-full max-w-[240px] overflow-hidden">
          {title}
          <div className="mt-1 text-sm">{description}</div>
        </div>
      </div>
      <div>
        {(menu?.items?.length ?? 0) > 0 && (
          <Dropdown menu={menu} placement="bottomCenter" trigger={['click']}>
            <Button size="small">
              {t('common.options')}
              <CaretDownOutlined className="text-xs" />
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  )
}

export default GlobalToast
