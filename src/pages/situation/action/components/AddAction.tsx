import FormModal from '@/components/XForm/Modal'
import { Button } from 'antd'
import { memo, type FC } from 'react'
// import { createAddActionFormItems } from '../constant'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import { addAction } from '@/service/modules/action'
import { XFormItem } from '@/components/XForm/types'

export const createAddActionFormItems = (
  typeOptions: { label: ReactNode; value: any }[],
): XFormItem[] => [
  {
    label: '行动名称',
    name: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入行动名称' }],
  },
  {
    label: '行动类型',
    name: 'type',
    type: 'select',
    options: typeOptions,
    rules: [{ required: true, message: '请选择行动类型' }],
  },
  {
    label: '备注',
    name: 'description',
    type: 'textarea',
  },
]

type PropsType = unknown

/** 创建行动 */
const AddAction: FC<PropsType> = memo(() => {
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
  const formItems = useMemo(
    () => createAddActionFormItems(actionTypeOptions),
    [actionTypeOptions],
  )
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleAddAction = async (data: any) => {
    setConfirmLoading(true)
    try {
      const resp = await addAction(data)
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
        创建行动
      </Button>
      <FormModal
        title="创建行动"
        open={open}
        items={formItems}
        confirmLoading={confirmLoading}
        onClose={() => setOpen(false)}
        onConfirm={handleAddAction}
      />
    </>
  )
})

AddAction.displayName = 'AddAction'

export default AddAction
