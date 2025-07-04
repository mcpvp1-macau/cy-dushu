import { ConfigProvider, Form, GetProps } from 'antd'
import { ReactNode, useLayoutEffect, type FC } from 'react'
import XForm from '../index'
import XModal from '@/components/XModal'

type PropsType = Omit<GetProps<typeof XForm>, 'title'> & {
  width?: string
  title?: ReactNode
  open?: boolean
  /** FormModal 内部自动会处理 loading 状态 */
  confirmLoading?: boolean
  /** @deprecated 继承自 Form, 参考 https://ant-design.antgroup.com/components/form-cn#form */
  layout?: 'auto' | number
  modalProps?: GetProps<typeof XModal>
  mask?: boolean
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
  modalProps,
  mask,
  ...restProps
}) => {
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
      <XModal
        title={title}
        open={open}
        onClose={onClose}
        onConfirm={handleConfirmClick}
        width={width ?? '318px'}
        centered
        confirmLoading={confirmLoading || loading}
        mask={mask}
        {...modalProps}
      >
        <XForm
          items={items}
          form={form}
          layout="vertical"
          colsProps={{ span: layout }}
          {...restProps}
        />
      </XModal>
    </ConfigProvider>
  )
}

export default FormModal
