import IconButton from './ui/button/IconButton'
import IconBack from '@/assets/icons/jsx/IconBack'
import { Form, Input, Popconfirm } from 'antd'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { LoadingOutlined } from '@ant-design/icons'
import IconTick from '@/assets/icons/jsx/IconTick'
import { ReactNode } from 'react'
import { TooltipPlacement } from 'antd/es/tooltip'

type PropsType = {
  value: string
  className?: string
  loading?: boolean
  backConfirm?: {
    content: ReactNode
    placement?: TooltipPlacement
  }
  right?: ReactNode
  /** 文本改变时 */
  onChange?: (value: string) => void
  /** 点保存时 */
  onFinish?: (value: string) => void
  onBackClick?: () => void
}

const EditableNameHeader: FC<PropsType> = memo(
  ({
    value,
    className,
    loading,
    right,
    onFinish,
    backConfirm,
    onBackClick,
  }) => {
    const [isEdit, setIsEdit] = useState(false)
    const { t } = useTranslation()

    const [form] = Form.useForm()

    useEffect(() => {
      form.setFieldsValue({ value })
    }, [value])

    const handleSaveClick = () => {
      onFinish?.(form.getFieldValue('value'))
      setIsEdit(false)
    }

    const handlePressEnter = () => {
      onFinish?.(form.getFieldValue('value'))
      setIsEdit(false)
    }

    return (
      <div
        className={clsx(
          'w-full flex items-center justify-between gap-2 overflow-hidden',
          'border-b border-solid border-gray-700',
          className,
        )}
      >
        <div>
          {backConfirm ? (
            <Popconfirm
              title={backConfirm.content}
              placement={backConfirm.placement}
              onConfirm={onBackClick}
            >
              <IconButton toolTipProps={{ title: t('common.back') }}>
                <IconBack />
              </IconButton>
            </Popconfirm>
          ) : (
            <IconButton
              toolTipProps={{ title: t('common.back') }}
              onClick={onBackClick}
            >
              <IconBack />
            </IconButton>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center h-[32px] overflow-hidden">
          <Form form={form} autoComplete="off">
            {loading ? (
              <div className="text-center">
                <LoadingOutlined />
              </div>
            ) : isEdit ? (
              <Form.Item name="value" noStyle>
                <Input size="small" onPressEnter={handlePressEnter} />
              </Form.Item>
            ) : (
              <h3 className="text-white text-base truncate">{value}</h3>
            )}
          </Form>
        </div>
        <div className="text-sm flex items-center">
          {right}
          {isEdit ? (
            <IconButton
              toolTipProps={{ title: t('common.save') }}
              onClick={handleSaveClick}
            >
              <IconTick />
            </IconButton>
          ) : (
            <IconButton
              toolTipProps={{ title: t('common.edit') }}
              onClick={() => setIsEdit(true)}
            >
              <IconEdit />
            </IconButton>
          )}
        </div>
      </div>
    )
  },
)

EditableNameHeader.displayName = 'EditableNameHeader'

export default EditableNameHeader
