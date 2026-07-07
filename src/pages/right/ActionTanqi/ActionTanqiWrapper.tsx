import useRightMode from '@/store/layout/useRightMode.store'
import CloseableHeader from '../components/CloseableHeader'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import TanqiDemo from '@/components/Tanqi/demo/TanqiDemo'
import ActionTanqi from './ActionTanqi'

type PropsType = unknown

const RightActionTanqiWrapper: FC<PropsType> = memo(() => {
  const actionId = useParams().actionId
  // 无行动上下文时使用纯前端演示版檀棋
  const useDemo = globalConfig.useFixedWingDemo && !actionId

  return (
    <div className="w-[350px] h-full overflow-hidden flex flex-col">
      <CloseableHeader
        onClose={() => {
          useRightMode.getState().updateRightOuterMode(null)
          useRightMode.getState().updateRightOuterDetailId(null)
        }}
      >
        <div className="flex gap-2 items-center">
          <IconTanQi className="device-detail-icon" />
          <h6 className="text-hightlight text-base">檀棋</h6>
        </div>
      </CloseableHeader>
      <div className="h-screen overflow-hidden">
        {useDemo ? <TanqiDemo /> : <ActionTanqi />}
      </div>
    </div>
  )
})

RightActionTanqiWrapper.displayName = 'RightActionTanqiWrapper'

export default RightActionTanqiWrapper
