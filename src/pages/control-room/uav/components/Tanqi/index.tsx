import { Sender } from '@ant-design/x'
import { useSearchParams } from 'react-router-dom'
import HistoryChats from './components/HistoryChats'
import {
  getDialogDetail,
  getDialogList,
  sendDialogMsg,
  startNewDialog,
  stopDialogReq,
} from '@/service/modules/tanqi'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import ChatDetail from './components/ChatDetail'
import AppSpin from '@/components/AppSpin'
import mitt from 'mitt'
import CreateChat from './components/CreateChat'
import resolveResp from './utils/resolveResp'
import { LoadingOutlined } from '@ant-design/icons'
import TaskUnderstanding from './components/TaskUnderstanding'
import useASR from './utils/asr'

export const msgEmitter = mitt<{
  message: { type: string; content: string; dialogId: number }
}>()

const Tanqi = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const chatIdStr = searchParams.get('chat')
  const chatId = chatIdStr ? Number(chatIdStr) : undefined

  const { t } = useTranslation()

  const [sendValue, setSendValue] = useState('')

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
        id: chatId!,
        page: 1,
        size: 0x3f3f3f3f,
      })
      res.data.rows = res.data.rows.map((item) => {
        if (item.recordType === 'RESPONSE') {
          item.responseMessage = JSON.parse(item.responseMessage)
          item.responseMessage = resolveResp(item.responseMessage)
        }
        return item
      })
      return res.data
    },
    enabled: !!chatId,
  })

  const [appendedRows, setApendedRows] = useState<any[]>([])

  // 发送消息
  const handleSubmit = async (message: string) => {
    let chatId2 = Number(chatId)
    if (!chatId) {
      chatId2 = await handleCreateChat()
    }
    setSendValue('')
    try {
      const resp = await sendDialogMsg({
        deviceId,
        id: chatId2,
        prompt: message,
        requestId: 0,
      })
      setApendedRows((prev) => [...prev, resp.data])
      setAiState(1)
    } catch (e) {
      setSending(false)
    } finally {
    }
  }

  // 停止对话
  const handleStop = async () => {
    await stopDialogReq({
      id: chatId!,
    })
    setAiState(0)
    setSending(false)
  }

  useEffect(() => {
    setApendedRows([])
  }, [chatDetail])

  // 监听 chatId 的变化
  useEffect(() => {
    setApendedRows([])
    setAiState(0)
    setSending(false)
  }, [chatId])

  // 监听全局 websocket 来的消息
  useEffect(() => {
    const handle = (data) => {
      if (data[0]?.dialogId !== chatId) {
        return
      }
      data = resolveResp(data)
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
    }
    msgEmitter.on('message', handle)
    return () => {
      msgEmitter.off('message', handle)
    }
  }, [])

  const { data: chats, isLoading: isLoadingChats } = useQuery(
    {
      queryKey: ['chats', deviceId],
      queryFn: () =>
        getDialogList({
          deviceId: deviceId,
        }),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const isTaskUnderstanding = useMemo(() => {
    if (!chats || !chatId) {
      return false
    }
    return (
      chats.find((item) => item.id === Number(chatId))?.taskUnderstanding === 1
    )
  }, [chats, chatId])

  const [isRecording, setIsRecording] = useState(false)

  const {
    onlineMsg,
    offlineMsg,
    handleStart: handleRecordStart,
    handleStop: handleRecordStop,
  } = useASR(isRecording)

  return (
    <div className="tanqi size-full overflow-hidden flex flex-col">
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
        <div className="flex justify-between">
          <div>
            {chatId && (
              <TaskUnderstanding
                isTaskUnderstanding={isTaskUnderstanding}
                chatId={chatId!}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 mb-2">
            {chats && !isLoadingChats ? (
              <HistoryChats data={chats} />
            ) : (
              <LoadingOutlined />
            )}
            {chatId && <CreateChat />}
          </div>
        </div>

        <div>
          <Sender
            value={sendValue + offlineMsg + onlineMsg}
            loading={creating || sending}
            allowSpeech={{
              recording: isRecording,
              onRecordingChange: (recording) => {
                if (recording === isRecording) {
                  return
                }
                if (recording) {
                  handleRecordStart()
                  setIsRecording(recording)
                } else {
                  setTimeout(() => {
                    handleRecordStop()
                    setIsRecording(recording)
                    setSendValue(sendValue + offlineMsg + onlineMsg)
                  }, 1000)
                }
              },
            }}
            onChange={setSendValue}
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
