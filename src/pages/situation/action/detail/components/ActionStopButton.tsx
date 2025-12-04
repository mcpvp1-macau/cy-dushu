import { Button, Popconfirm } from 'antd'
import { checkEndAction, endAction } from '@/service/modules/action'

interface Props {
  actionId: string
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
      await endAction(actionId)
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
  // 2. 如果检查失败，按需求直接执行终止逻辑。
  // 3. 未触发确认弹窗时直接执行终止。
  const handleEndActionClick = useMemoizedFn(async () => {
    setEndActionLoading(true)
    let needConfirm = false
    try {
      const res = await checkEndAction(actionId)
      if (res.data === false) {
        needConfirm = true
        setShowStopConfirm(true)
        return
      }
    } catch (error) {
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
    <Popconfirm
      open={showStopConfirm}
      title={t('action.detail.end.forceConfirm.title')}
      description={t('action.detail.end.forceConfirm.description')}
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
    </Popconfirm>
  )
}

ActionStopButton.displayName = 'ActionStopButton'

export default memo(ActionStopButton)
