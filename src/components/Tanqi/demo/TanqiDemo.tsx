import { ArrowUpOutlined, AudioOutlined } from '@ant-design/icons'
import { Button, Input, Tooltip } from 'antd'
import { TANQI_NATURAL_SCRIPT } from './natural-script'
import { useFullFlowDemoStore } from '@/demo/situation/full-flow-demo.store'
import {
  getReportByType,
  matchReportType,
  TanqiReport,
  TanqiReportType,
} from './report-data'
import TanqiReportCard from './TanqiReportCard'
import { useParams } from 'react-router-dom'

type PropsType = unknown

type DemoMessage = {
  key: string
  role: 'user' | 'ai'
  content?: string
  report?: TanqiReport
}

/** 各报告类型的默认回复引导语 */
const MODE_REPLY_INTRO: Record<TanqiReportType, string> = {
  task: '已根据当前装备与目标态势生成任务规划：',
  situation: '已汇总当前情报生成态势分析报告：',
  damage: '已根据打击前后情报完成毁伤评估：',
  evaluation: '已汇总本次行动生成作战效能评估报告：',
  inventory: '当前可用无人装备清单如下：',
}

/** 输入框提示 (与原型一致) */
const INPUT_PROMPT = '请描述任务目标、区域、可用装备和时间要求。'
const FULL_FLOW_INPUT_PROMPT = '请输入演示指令。'

/** 檀棋会话演示面板（纯前端 Mock） */
const TanqiDemo: FC<PropsType> = memo(() => {
  const { actionId: actionIdParam } = useParams()
  const actionId = Number(actionIdParam)
  const fullFlowMode = useFullFlowDemoStore((s) => s.mode)
  const fullFlowMessages = useFullFlowDemoStore((s) =>
    Number.isFinite(actionId) ? s.messagesByActionId[actionId] : undefined,
  )
  const fullFlowAction = useFullFlowDemoStore((s) =>
    Number.isFinite(actionId)
      ? s.actions.find((item) => item.id === actionId)
      : undefined,
  )
  const isFullFlow = fullFlowMode === 'full-flow'
  const hasFullFlowAction = isFullFlow && Number.isFinite(actionId)
  const queryClient = useQueryClient()

  // 预置会话: 原型「自然语言交互版」完整脚本
  const [standardMessages, setStandardMessages] = useState<DemoMessage[]>(() =>
    TANQI_NATURAL_SCRIPT.map((e, i) => ({
      key: `script-${i}`,
      role: e.role,
      content: e.content,
      report: e.report,
    })),
  )
  const [inputValue, setInputValue] = useState('')
  const [thinking, setThinking] = useState(false)
  const messages = isFullFlow
    ? hasFullFlowAction
      ? (fullFlowMessages ?? [])
      : []
    : standardMessages

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const replyTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const viewport = scrollAreaRef.current
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current)
      }
    }
  }, [])

  /** 追加消息并模拟 AI 回复 */
  const send = useMemoizedFn((message: string, forceType?: TanqiReportType) => {
    if (thinking) {
      return
    }
    if (isFullFlow) {
      if (!fullFlowAction) return

      useFullFlowDemoStore.getState().appendMessage(actionId, {
        key: `user-${Date.now()}`,
        role: 'user',
        content: message,
      })
      setThinking(true)
      replyTimerRef.current = setTimeout(() => {
        const report = useFullFlowDemoStore
          .getState()
          .createNextReport(actionId)

        if (report) {
          useFullFlowDemoStore.getState().appendMessage(actionId, {
            key: `ai-${Date.now()}`,
            role: 'ai',
            report,
          })
          queryClient.invalidateQueries({
            queryKey: ['action', actionId, 'items'],
          })
          queryClient.invalidateQueries({ queryKey: ['airlineTemplate'] })
          queryClient.invalidateQueries({ queryKey: ['waylineTemplates'] })
        }
        setThinking(false)
      }, 900)
      return
    }

    const type: TanqiReportType = forceType ?? matchReportType(message) ?? 'task'
    setStandardMessages((prev) => [
      ...prev,
      { key: `user-${Date.now()}`, role: 'user', content: message },
    ])
    setThinking(true)
    replyTimerRef.current = setTimeout(() => {
      setStandardMessages((prev) => [
        ...prev,
        {
          key: `ai-${Date.now()}`,
          role: 'ai',
          content: MODE_REPLY_INTRO[type],
          report: getReportByType(type),
        },
      ])
      setThinking(false)
    }, 1200)
  })

  const handleSubmit = () => {
    const message = inputValue.trim()
    if (!message) {
      return
    }
    setInputValue('')
    send(message)
  }

  return (
    <div className="size-full overflow-hidden flex flex-col">
      {/* 会话区 */}
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
                {item.content && (
                  <div className="text-fore text-sm leading-5">
                    {item.content}
                  </div>
                )}
                {item.report && (
                  <TanqiReportCard
                    report={item.report}
                    actionId={hasFullFlowAction ? actionId : undefined}
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

      {/* 输入区 */}
      <div
        className="m-2 rounded border border-solid border-ground-3 bg-ground-2 p-2 flex flex-col gap-2"
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 5 }}
          placeholder={isFullFlow ? FULL_FLOW_INPUT_PROMPT : INPUT_PROMPT}
          variant="borderless"
          className="!px-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
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
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={<ArrowUpOutlined />}
            loading={thinking}
            disabled={
              !inputValue.trim() ||
              (hasFullFlowAction && !fullFlowAction) ||
              (isFullFlow && !hasFullFlowAction)
            }
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
})

TanqiDemo.displayName = 'TanqiDemo'

export default TanqiDemo
