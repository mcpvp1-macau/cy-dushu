import IconButton from '@/components/ui/button/IconButton'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Sender } from '@ant-design/x'
import { useSearchParams } from 'react-router-dom'
import HistoryChats from './components/HistoryChats'
import {
  getDialogDetail,
  sendDialogMsg,
  startNewDialog,
  stopDialogReq,
} from '@/service/modules/tanqi'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import ChatDetail from './components/ChatDetail'
import AppSpin from '@/components/AppSpin'
import mitt from 'mitt'

export const msgEmitter = mitt<{
  message: { type: string; content: string; dialogId: number }
}>()

const Tanqi = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const chatId = searchParams.get('chat')

  const { t } = useTranslation()

  // 0 空闲 1 思考中 2 回答中
  const [aiState, setAiState] = useState<0 | 1 | 2>(0)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)

  const queryClient = useQueryClient()

  // 创建对话
  const handleCreateChat = async () => {
    setCreating(true)
    try {
      const res = await startNewDialog({
        deviceId,
      })
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.set('chat', res.data.toString())
      setSearchParams(nextSearchParams, { replace: true })
      queryClient.invalidateQueries({
        queryKey: ['chats', deviceId],
      })
      return res.data
    } finally {
      setCreating(false)
    }
  }

  const { data: chatDetail, isLoading } = useQuery({
    queryKey: ['chatDetail', chatId],
    queryFn: async () => {
      const res = await getDialogDetail({
        id: Number(chatId),
        page: 1,
        size: 0x3f3f3f3f,
      })
      res.data.rows = res.data.rows.map((item) => {
        if (item.recordType === 'RESPONSE') {
          item.responseMessage = JSON.parse(item.responseMessage)
        }
        return item
      })
      return res.data
    },
    enabled: !!chatId,
  })

  const [appendedRows, setApendedRows] = useState<any[]>([])
  const waitReqId = useRef<string>('')
  const handleSubmit = async (message: string) => {
    let chatId2 = Number(chatId)
    if (!chatId) {
      chatId2 = await handleCreateChat()
    }
    setSending(true)
    try {
      const resp = await sendDialogMsg({
        deviceId,
        id: chatId2,
        prompt: message,
        requestId: 0,
      })
      setApendedRows((prev) => [...prev, resp.data])
      waitReqId.current = resp.data.requestId
      setAiState(1)
    } catch (e) {
      setSending(false)
    } finally {
    }
  }

  const handleStop = async () => {
    await stopDialogReq({
      id: Number(chatId),
    })
    setAiState(0)
    waitReqId.current = ''
    setSending(false)
  }

  useEffect(() => {
    setApendedRows([])
  }, [chatDetail])

  useEffect(() => {
    setApendedRows([])
    setAiState(0)
    setSending(false)
    waitReqId.current = ''
  }, [chatId])

  useEffect(() => {
    const handle = (data) => {
      console.log(data, waitReqId.current)
      if (data[0]?.requestId !== waitReqId.current) {
        return
      }
      setApendedRows((prev) => [
        ...prev,
        {
          id: dayjs().valueOf(),
          recordType: 'RESPONSE',
          responseMessage: data,
        },
      ])
      setAiState(0)
      setSending(false)
      waitReqId.current = ''
    }
    msgEmitter.on('message', handle)
    return () => {
      msgEmitter.off('message', handle)
    }
  }, [])

  return (
    <div className="size-full overflow-hidden flex flex-col">
      <div className="grow flex flex-col overflow-hidden">
        {creating || isLoading ? (
          <AppSpin />
        ) : !chatId || !chatDetail?.rows?.length ? (
          <div className="text-xl text-fore opacity-80 size-full flex items-center justify-center">
            <p className="text-center">{t('tanqi.welcome.msg')}</p>
          </div>
        ) : (
          <ChatDetail
            aiState={aiState}
            bubbles={[...chatDetail.rows, ...appendedRows]}
          />
        )}
      </div>
      <div className="m-2">
        <div className="flex justify-end gap-3 mb-2">
          <HistoryChats />
          {chatId && (
            <IconButton
              toolTipProps={{
                title: t('tanqi.createChat.title'),
              }}
              onClick={() => {
                const nextSearchParams = new URLSearchParams(searchParams)
                nextSearchParams.delete('chat')
                setSearchParams(nextSearchParams, { replace: true })
              }}
            >
              <PlusCircleOutlined />
            </IconButton>
          )}
        </div>
        <div>
          <Sender
            loading={creating || sending}
            allowSpeech
            onSubmit={handleSubmit}
            onCancel={handleStop}
          />
        </div>
      </div>
    </div>
  )
})

Tanqi.displayName = 'Tanqi'

export default Tanqi
