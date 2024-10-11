import { Button, ConfigProvider, Form, GetProps, Modal } from 'antd'
import { useLayoutEffect, type FC } from 'react'
import styles from './index.module.less'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import XForm from '../index'

type PropsType = GetProps<typeof XForm> & {
  width?: string
  title: string
  open: boolean
  confirmLoading?: boolean
  /** @deprecated */
  layout?: 'auto' | number
  onConfirm?: (data: any) => void
  onClose?: () => void
}

const FormModal: FC<PropsType> = ({
  width,
  open,
  title,
  confirmLoading,
  form: propForm,
  items,
  layout = 24,
  onConfirm,
  onClose,
  ...restProps
}) => {
  const [innerForm] = Form.useForm()

  const form = propForm ?? innerForm

  const handleConfirmClick = () => {
    form.validateFields().then(onConfirm)
  }

  useLayoutEffect(() => {
    if (open && !propForm) {
      form.resetFields()
    }
  }, [open, propForm])

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: '#1c2630',
          },
        },
      }}
    >
      <Modal
        open={open}
        closable={false}
        footer={null}
        centered
        width={width ?? '318px'}
      >
        <div className={styles.addModal}>
          <div className="header">
            <div className="text-white">{title}</div>
            <IconButton style={{ height: '20px' }} onClick={onClose}>
              <IconClose style={{ fontSize: '20px' }} />
            </IconButton>
          </div>
          <div className="px-3 pt-3">
            <XForm
              items={items}
              form={form}
              layout="vertical"
              colsProps={{
                span: layout,
              }}
              {...restProps}
            />
          </div>
          <div className="text-right p-3 pt-0">
            <Button onClick={onClose}>取消</Button>
            <Button
              loading={confirmLoading}
              type="primary"
              style={{ marginLeft: '12px' }}
              onClick={handleConfirmClick}
            >
              确定
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  )
}

export default FormModal
