import { Button, ConfigProvider, GetProps, Modal } from 'antd'
import { type FC, type ReactNode } from 'react'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import './styles.modle.less'

type PropsType = GetProps<typeof Modal> & {
  title: ReactNode
  confirmLoading?: boolean
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
  onClose,
  onConfirm,
  ...restProps
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 3,
          controlHeight: 30,
        },
        components: {
          Modal: {
            contentBg: '#1c2630',
          },
        },
      }}
    >
      <Modal {...restProps} closable={false} footer={null}>
        <div className="liqun-modal">
          <div className="header">
            <div className="title">{title}</div>
            <IconButton style={{ height: '20px' }} onClick={onClose}>
              <IconClose style={{ fontSize: '20px' }} />
            </IconButton>
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
                取消
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
                确认
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>
    </ConfigProvider>
  )
}

export default XModal
