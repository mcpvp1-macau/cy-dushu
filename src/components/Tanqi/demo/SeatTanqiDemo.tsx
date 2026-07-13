import { ArrowUpOutlined, AudioOutlined } from '@ant-design/icons'
import { Button, Input, Tooltip } from 'antd'
import {
  getSeatDemoAccount,
  getSeatDemoNextReport,
  useSeatDemoStore,
} from '@/demo/situation/seat-demo.store'
import {
  getSeatDemoReportLabel,
  SEAT_DEMO_INPUT_PLACEHOLDER,
} from '@/demo/situation/seat-demo.logic'
import TanqiReportCard from './TanqiReportCard'

type PropsType = unknown

const SeatTanqiDemo: FC<PropsType> = memo(() => {
  const state = useSeatDemoStore()
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const replyTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { seat, activeActionId } = state
  const messages = activeActionId === null
    ? []
    : state.messagesByActionAndSeat[`${activeActionId}:${seat}`] ?? []
  const activeAccount = getSeatDemoAccount(seat)
  const nextReport = activeActionId === null
    ? null
    : getSeatDemoNextReport(activeActionId, seat)
  const canSubmit =
    activeAccount.canUseTanqi && activeActionId !== null && !!nextReport && !thinking

  useEffect(() => {
    const viewport = scrollAreaRef.current
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(
    () => () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current)
    },
    [],
  )

  const handleSubmit = useMemoizedFn(() => {
    const message = inputValue.trim()
    if (!message || !canSubmit || activeActionId === null) return

    setInputValue('')
    useSeatDemoStore.getState().appendMessage(activeActionId, seat, {
      key: `user-${Date.now()}`,
      role: 'user',
      content: message,
    })
    setThinking(true)
    replyTimerRef.current = setTimeout(() => {
      const report = useSeatDemoStore
        .getState()
        .createNextReport(activeActionId, seat)
      if (report) {
        useSeatDemoStore.getState().appendMessage(activeActionId, seat, {
          key: `ai-${Date.now()}`,
          role: 'ai',
          report,
        })
        queryClient.invalidateQueries({
          queryKey: ['action', activeActionId, 'items'],
        })
        queryClient.invalidateQueries({ queryKey: ['airlineTemplate'] })
        queryClient.invalidateQueries({ queryKey: ['waylineTemplates'] })
      }
      setThinking(false)
    }, 900)
  })

  if (!activeAccount.canUseTanqi) {
    return <div className="size-full" />
  }

  return (
    <div className="size-full overflow-hidden flex flex-col">
      <div
        ref={scrollAreaRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pt-2"
      >
        <div className="flex flex-col gap-3 pb-3 w-full">
          {messages.map((item) =>
            item.role === 'user' ? (
              <div key={item.key} className="flex w-full justify-end">
                <div className="max-w-[85%] bg-sky-900/40 border border-solid border-sky-700/50 px-3 py-2 rounded text-fore text-sm leading-6">
                  {item.content}
                </div>
              </div>
            ) : (
              <div key={item.key} className="flex flex-col gap-1.5 w-full">
                {item.report && (
                  <TanqiReportCard
                    report={item.report}
                    actionId={activeActionId ?? undefined}
                    badgeLabel={getSeatDemoReportLabel(item.report.type)}
                  />
                )}
              </div>
            ),
          )}
          {thinking && (
            <div className="text-fore opacity-60 text-sm animate-pulse">
              正在生成报告...
            </div>
          )}
        </div>
      </div>

      <div
        className="m-2 rounded border border-solid border-ground-3 bg-ground-2 p-2 flex flex-col gap-2"
        onKeyDown={(event) => event.stopPropagation()}
        onKeyUp={(event) => event.stopPropagation()}
      >
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 5 }}
          placeholder={SEAT_DEMO_INPUT_PLACEHOLDER}
          variant="borderless"
          className="!px-1"
          value={inputValue}
          disabled={!canSubmit}
          onChange={(event) => setInputValue(event.target.value)}
          onPressEnter={(event) => {
            if (!event.shiftKey) {
              event.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="flex justify-end items-center gap-1.5">
          <Tooltip title="语音输入（未接入）">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<AudioOutlined className="text-primary" />}
              disabled={!canSubmit}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={<ArrowUpOutlined />}
            loading={thinking}
            disabled={!inputValue.trim() || !canSubmit}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
})

SeatTanqiDemo.displayName = 'SeatTanqiDemo'

export default SeatTanqiDemo
