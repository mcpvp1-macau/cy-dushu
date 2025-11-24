import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { DictEnum } from '@/enum/dict'
import { updAction } from '@/service/modules/action'
import { useDictOptions } from '@/store/useDict.store'
import { AppstoreOutlined } from '@ant-design/icons'

type PropsType = {
  data: API_ACTION.domain.ActionDetail
}

/** 行动类型切换 */
const ActionTypeCheckout: FC<PropsType> = memo(({ data }) => {
  const [open, { setTrue, setFalse }] = useBoolean()

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)

  const queryClient = useQueryClient()
  const handleConfirm = async (values) => {
    await updAction({
      id: data.id,
      name: data.name,
      type: values.actionType,
    })
    setFalse()
    await queryClient.invalidateQueries({
      queryKey: ['action', data.id + ''],
    })
  }

  return (
    <>
      <IconButton
        className="scale-125 mr-3"
        tippyProps={{ content: '修改行动类型' }}
        onClick={setTrue}
      >
        <AppstoreOutlined />
      </IconButton>
      <FormModal
        key={data?.type}
        open={open}
        title="修改行动类型"
        initialValues={{
          actionType: data?.type,
        }}
        items={[
          {
            label: '行动类型',
            name: 'actionType',
            type: 'select',
            options: actionTypeOptions,
          },
        ]}
        onConfirm={handleConfirm}
        onClose={setFalse}
      />
    </>
  )
})

ActionTypeCheckout.displayName = 'ActionTypeCheckout'

export default ActionTypeCheckout
