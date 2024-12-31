import { memo, type FC } from 'react'
import IconButton from './ui/button/IconButton'
import IconBack from '@/assets/icons/jsx/IconBack'
import { Form, Input } from 'antd'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconSave from '@/assets/icons/jsx/IconSave'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  value: string
  className?: string
  loading?: boolean
  /** 文本改变时 */
  onChange?: (value: string) => void
  /** 点保存时 */
  onFinish?: (value: string) => void
  onBackClick?: () => void
}

const EditableNameHeader: FC<PropsType> = memo(
  ({ value, className, loading, onFinish, onBackClick }) => {
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
          <IconButton
            toolTipProps={{ title: t('common.back') }}
            onClick={onBackClick}
          >
            <IconBack />
          </IconButton>
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
        <div className="text-sm">
          {isEdit ? (
            <IconButton
              toolTipProps={{ title: t('common.save') }}
              onClick={handleSaveClick}
            >
              <IconSave />
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
