import TextButton from '@/components/ui/button/TextButton'
import { startActionPlanBreakPoint } from '@/service/modules/action-plan'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  id: number
  onSuccess?: () => void
}

const StartBreakPoint: FC<PropsType> = memo(({ id, onSuccess }) => {
  const [isLoading, { setTrue, setFalse }] = useBoolean()
  return (
    <TextButton
      disabled={isLoading}
      onClick={async () => {
        setTrue()
        try {
          await startActionPlanBreakPoint({ breakPointId: id })
          onSuccess?.()
        } finally {
          setFalse()
        }
      }}
    >
      {isLoading ? <LoadingOutlined /> : '续飞'}
    </TextButton>
  )
})

StartBreakPoint.displayName = 'StartBreakPoint'

export default StartBreakPoint
