import { Button, ConfigProvider, GetProps, Modal } from 'antd'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import './styles.modle.less'

type PropsType = GetProps<typeof Modal> & {
  title: ReactNode
  confirmLoading?: boolean
  titleRight?: ReactNode
  children: ReactNode
  onConfirm?: () => void
  onClose?: () => void
  footer?: boolean
  noPadding?: boolean
}

const XModal: FC<PropsType> = ({
  title,
  confirmLoading,
  children,
  footer = true,
  noPadding = false,
  titleRight,
  onClose,
  onConfirm,
  ...restProps
}) => {
  const { t } = useTranslation()

  const [shift, setShift] = useState({
    x: 0,
    y: 0,
  })
  const startPosition = useRef({
    x: 0,
    y: 0,
  })
  const startShift = useRef({
    x: 0,
    y: 0,
  })

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startPosition.current = {
      x: e.clientX,
      y: e.clientY,
    }
    startShift.current = {
      x: shift.x,
      y: shift.y,
    }

    const handleMouseMove = (e: MouseEvent) => {
      setShift({
        x: startShift.current.x + e.clientX - startPosition.current.x,
        y: startShift.current.y + e.clientY - startPosition.current.y,
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'auto'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    // 清空选中的内容
    document.getSelection()?.removeAllRanges()
  }

  return (
    <ConfigProvider
      theme={{
        cssVar: {
          key: 'dushu',
        },
        hashed: false,
        components: {
          Modal: {
            contentBg: '#1c2630',
          },
        },
      }}
    >
      <Modal
        {...restProps}
        closable={false}
        footer={null}
        modalRender={(modal) => (
          <div style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }}>
            {modal}
          </div>
        )}
        mask={restProps.mask ?? false}
      >
        <div className="liqun-modal">
          <div className="header" onMouseDown={handleHeaderMouseDown}>
            <div className="title">{title}</div>
            <div className="flex gap-1 items-center">
              {titleRight}
              <IconButton className="text-xl" onClick={onClose}>
                <IconClose />
              </IconButton>
            </div>
          </div>
          <div
            className={clsx(
              {
                'pt-3': !noPadding,
                'px-3': !noPadding,
              },
              'overflow-hidden',
            )}
          >
            {children}
          </div>
          {footer ? (
            <div className="footer">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose?.()
                }}
              >
                {t('modal.cancel')}
              </Button>
              <Button
                loading={confirmLoading}
                type="primary"
                className="ml-3"
                onClick={(e) => {
                  e.stopPropagation()
                  onConfirm?.()
                }}
              >
                {t('modal.confirm')}
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>
    </ConfigProvider>
  )
}

export default XModal
