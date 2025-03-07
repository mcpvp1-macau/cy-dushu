import IconChat from '@/assets/icons/jsx/IconChat'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { deleteDialog, updateDialog } from '@/service/modules/tanqi'
import { Input, Popconfirm, Spin } from 'antd'
import { useSearchParams } from 'react-router-dom'

type PropsType = {
  item: API_TANQI.domain.DialogTask
}

const HistoryChatItem: FC<PropsType> = memo(({ item }) => {
  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()

  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const handlePressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setIsLoading(true)
    try {
      await updateDialog({
        id: item.id,
        dialogName: value,
      })
      queryClient.invalidateQueries({
        queryKey: ['chats', deviceId],
      })
    } finally {
      setIsEdit(false)
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteDialog({
        id: item.id,
      })
      queryClient.invalidateQueries({
        queryKey: ['chats', deviceId],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Spin spinning={isLoading}>
      <li
        key={item.id}
        className="text-fore flex items-start gap-2 p-2 hover:bg-ground-2 rounded cursor-pointer"
        onClick={() => {
          const nextSearchParams = new URLSearchParams(searchParams)
          nextSearchParams.set('chat', item.id.toString())
          setSearchParams(nextSearchParams, { replace: true })
        }}
      >
        <IconChat className="mt-1.5" />
        <div className="w-60 max-w-60 truncate">
          <div className="text-white">
            {isEdit ? (
              <Input
                defaultValue={item.dialogName}
                size="small"
                onPressEnter={handlePressEnter}
              />
            ) : (
              <p className="h-6 leading-6">{item.dialogName}</p>
            )}
          </div>
          <div className="text-xs">{item.gmtCreate}</div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <IconButton onClick={() => setIsEdit(!isEdit)}>
            <IconEdit />
          </IconButton>
          <Popconfirm
            title={t('tanqi.historyChats.delete.title')}
            onConfirm={handleDelete}
          >
            <IconButton>
              <IconDelete />
            </IconButton>
          </Popconfirm>
        </div>
      </li>
    </Spin>
  )
})

HistoryChatItem.displayName = 'HistoryChatItem'

export default HistoryChatItem
