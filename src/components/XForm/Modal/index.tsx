import { Button, ConfigProvider, Form, GetProps, Modal } from 'antd'
import { useLayoutEffect, type FC } from 'react'
import styles from './index.module.less'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import XForm from '../index'

type PropsType = GetProps<typeof XForm> & {
  width?: string
  title: string
  open?: boolean
  /** FormModal 内部自动会处理 loading 状态 */
  confirmLoading?: boolean
  /** @deprecated 继承自 Form, 参考 https://ant-design.antgroup.com/components/form-cn#form */
  layout?: 'auto' | number
  onConfirm?: (data: any) => Promise<void> | void
  onClose?: () => void
}

/** FormModal 表单提交对话框 */
const FormModal: FC<PropsType> = ({
  width,
  open = true,
  title,
  confirmLoading,
  form: propForm,
  items,
  layout = 24,
  onConfirm,
  onClose,
  ...restProps
}) => {
  const { t } = useTranslation()
  const [innerForm] = Form.useForm()

  const form = propForm ?? innerForm
  const [loading, setLoading] = useState(false)
  const handleConfirmClick = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      onConfirm?.(values)
    } finally {
      setLoading(false)
    }
  }

  useLayoutEffect(() => {
    if (open && !propForm) {
      form.resetFields()
    }
  }, [open, propForm])

  return (
    <ConfigProvider
      theme={{
        cssVar: {
          key: 'dushu',
        },
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
            <Button onClick={onClose}>{t('modal.cancel')}</Button>
            <Button
              loading={confirmLoading || loading}
              type="primary"
              style={{ marginLeft: '12px' }}
              onClick={handleConfirmClick}
            >
              {t('modal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  )
}

export default FormModal
