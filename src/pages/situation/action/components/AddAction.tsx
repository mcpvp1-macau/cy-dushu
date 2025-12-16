import FormModal from '@/components/XForm/Modal'
import { Button, Form } from 'antd'
// import { createAddActionFormItems } from '../constant'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import { addAction } from '@/service/modules/action'
import { XFormItem } from '@/components/XForm/types'
import { TFunctionNonStrict } from 'i18next'
import { generateDefaultActionName } from '@/utils/action'

export const createAddActionFormItems = (
  t: TFunctionNonStrict<'transition', undefined>,
  typeOptions: { label: ReactNode; value: any }[],
): XFormItem[] => [
  {
    label: t('action.add.form.name.label'),
    name: 'name',
    type: 'input',
    rules: [
      { required: true, message: t('action.add.form.name.required_msg') },
    ],
  },
  {
    label: t('action.add.form.type.label'),
    name: 'type',
    type: 'select',
    options: typeOptions,
    rules: [
      { required: true, message: t('action.add.form.type.required_msg') },
    ],
  },
  {
    label: t('action.add.form.description.label'),
    name: 'description',
    type: 'textarea',
  },
]

type PropsType = {
  extra?: Record<string, any>
}

/** 创建行动 */
const AddAction: FC<PropsType> = memo(({ extra }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
  const formItems = useMemo(
    () => createAddActionFormItems(t, actionTypeOptions),
    [i18n.language, actionTypeOptions],
  )
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return

    form.resetFields()
    form.setFieldsValue({
      name: generateDefaultActionName(),
    })
  }, [form, open])

  const handleAddAction = async (data: any) => {
    setConfirmLoading(true)
    try {
      const resp = await addAction({ ...(extra ?? {}), ...data })
      queryClient.invalidateQueries({
        queryKey: ['actionList'],
        exact: false,
      })
      setOpen(false)
      navigate(`/action/${resp.data.actionId}`)
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <Button className="w-28" type="primary" onClick={() => setOpen(true)}>
        {t('action.add.title')}
      </Button>
      <FormModal
        title={t('action.add.title')}
        open={open}
        items={formItems}
        form={form}
        confirmLoading={confirmLoading}
        onClose={() => setOpen(false)}
        onConfirm={handleAddAction}
      />
    </>
  )
})

AddAction.displayName = 'AddAction'

export default AddAction
