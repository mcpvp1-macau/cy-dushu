import IconButton from '../ui/button/IconButton'
import IconAddAction from '@/assets/icons/jsx/IconAddAction'
import FormModal from '../XForm/Modal'
import { DeviceEnum } from '@/enum/device'
import { DictEnum } from '@/enum/dict'
import { useDictOptions } from '@/store/useDict.store'
import { fastAddAction } from '@/service/modules/action'
import { XFormItem } from '@/components/XForm/types'
import { useAppMsg } from '@/hooks/useAppMsg'
import useStartActionItem from '@/hooks/service/action/useStartActionItem'
import { startActionItem as startActionItemRequest } from '@/service/modules/action-item'

type PropsType = {
  deviceId: string
  deviceType: string | DeviceEnum
}

const QuickCreateAction: FC<PropsType> = memo(({ deviceId, deviceType }) => {
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { t, i18n } = useTranslation()
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const { startActionItem: startActionItemWithConfirm, stopModalHolder } =
    useStartActionItem(true)

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
  const formItems = useMemo<XFormItem[]>(
    () => [
      {
        label: t('action.add.form.name.label'),
        name: 'name',
        type: 'input',
        rules: [
          {
            required: true,
            message: t('action.add.form.name.required_msg'),
          },
        ],
      },
      {
        label: t('action.add.form.type.label'),
        name: 'type',
        type: 'select',
        options: actionTypeOptions,
        rules: [
          {
            required: true,
            message: t('action.add.form.type.required_msg'),
          },
        ],
      },
    ],
    [i18n.language, actionTypeOptions],
  )

  const handleQuickCreate = async (values: { name: string; type: string }) => {
    setConfirmLoading(true)
    try {
      const resp = await fastAddAction({
        ...values,
        deviceIds: deviceId,
        deviceType,
      })
      msgApi.success('行动创建成功')
      setOpen(false)
      // 处理可能存在的正在运行任务
      const actionItemIds = resp.data?.actionItemIds ?? []
      Promise.allSettled(
        actionItemIds.map(async (id) => {
          await startActionItemWithConfirm(() => startActionItemRequest(id))
        }),
      )
      // 刷新最新任务数据
      await queryClient.invalidateQueries({
        queryKey: ['getLatestTask', deviceId],
      })
      msgApi.success(t('api.success.msg'))
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <IconButton
        tippyProps={{ content: '创建行动' }}
        onClick={() => setOpen(true)}
      >
        <IconAddAction />
      </IconButton>
      {open && (
        <FormModal
          title="快捷创建行动任务"
          open={open}
          items={formItems}
          confirmLoading={confirmLoading}
          onClose={() => setOpen(false)}
          onConfirm={handleQuickCreate}
        />
      )}
      {stopModalHolder}
    </>
  )
})

QuickCreateAction.displayName = 'QuickCreateAction'

export default QuickCreateAction
