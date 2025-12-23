import { Button } from 'antd'
import LiqunPopConfirm from '@/components/ui/LiqunPopConfirm'
import { checkEndAction, endAction } from '@/service/modules/action'

interface Props {
  actionId: number
}

const ActionStopButton: FC<Props> = ({ actionId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [endActionLoading, setEndActionLoading] = useState(false)

  // 真正发起终止行动请求的函数，确保在成功后刷新列表并返回上一页
  const handleEndAction = useMemoizedFn(async () => {
    setShowStopConfirm(false)
    setEndActionLoading(true)
    try {
      await endAction(String(actionId))
      await queryClient.invalidateQueries({
        queryKey: ['actionList'],
        exact: false,
        type: 'all',
      })
      navigate('/action', { replace: true })
    } finally {
      setEndActionLoading(false)
    }
  })

  // 点击终止按钮时的流程：
  // 1. 先调用检查接口，如果需要二次确认则弹出 Popconfirm。
  // 2. 如果检查要弹窗，按需求直接执行终止逻辑。
  // 3. 未触发确认弹窗时直接执行终止。
  const handleEndActionClick = useMemoizedFn(async () => {
    setEndActionLoading(true)
    let needConfirm = false
    try {
      const res = await checkEndAction(String(actionId))
      if (res.data === true) {
        needConfirm = true
        setShowStopConfirm(true)
        return
      }
    } catch (_error) {
      await handleEndAction()
      return
    } finally {
      if (needConfirm) {
        setEndActionLoading(false)
      }
    }
    await handleEndAction()
  })

  return (
    <LiqunPopConfirm
      open={showStopConfirm}
      title={t('action.stop.confirm.title')}
      description={
        t('action.detail.end.forceConfirm.title') +
        t('action.detail.end.forceConfirm.description')
      }
      onConfirm={handleEndAction}
      onCancel={() => setShowStopConfirm(false)}
    >
      <Button
        type="primary"
        className="w-28"
        onClick={handleEndActionClick}
        loading={endActionLoading}
      >
        {t('action.detail.end.title')}
      </Button>
    </LiqunPopConfirm>
  )
}

ActionStopButton.displayName = 'ActionStopButton'

export default memo(ActionStopButton)
