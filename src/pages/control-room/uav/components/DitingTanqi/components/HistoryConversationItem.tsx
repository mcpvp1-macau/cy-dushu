import IconChat from '@/assets/icons/jsx/IconChat'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import { dft } from '@/constant/time-fmt'
import {
  deleteConversation,
  updateConversation,
} from '@/service/modules/diting-tanqi'
import { Input, Popconfirm, Spin } from 'antd'
import { ComponentRef } from 'react'
import { useSearchParams } from 'react-router-dom'

type PropsType = {
  item: API_DITING_TANQI.domain.ConversationItem
  groupName: string
}

const HistoryConversationItem: FC<PropsType> = memo(({ item, groupName }) => {
  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()

  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const handlePressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setIsLoading(true)
    try {
      await updateConversation(item.id, { name: value })
      await queryClient.invalidateQueries({
        queryKey: ['diting-tanqi', 'conversations', groupName],
      })
    } finally {
      setIsEdit(false)
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteConversation(item.id)
      await queryClient.invalidateQueries({
        queryKey: ['diting-tanqi', 'conversations', groupName],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

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
                ref={inputRef}
                defaultValue={item.name}
                size="small"
                onPressEnter={handlePressEnter}
              />
            ) : (
              <p className="h-6 leading-6">{item.name}</p>
            )}
          </div>
          <div className="text-xs">{dayjs(item.create_time).format(dft)}</div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {
            <IconButton
              onClick={() => {
                if (isEdit) {
                  setIsEdit(false)
                } else {
                  setIsEdit(true)
                  setTimeout(() => {
                    inputRef.current?.focus()
                  })
                }
              }}
            >
              <IconEdit />
            </IconButton>
          }
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

HistoryConversationItem.displayName = 'HistoryChatItem'

export default HistoryConversationItem
