import SegmentTitle from '@/components/ui/SegmentTitle'
import { Switch } from 'antd'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'

type PropsType = {
  state: Record<string, any>
}

const AirTransferEnable: FC<PropsType> = memo((props) => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const queryClient = useQueryClient()

  return (
    <div className="flex justify-between items-center">
      <SegmentTitle title="空中回传" />
      <Switch
        size="small"
        value={props.state.airTransferEnable}
        onChange={async (e) => {
          await setDeviceProp(productKey, deviceId, { airTransferEnable: e })
          await queryClient.invalidateQueries({
            queryKey: ['deviceDetail', deviceId],
          })
        }}
      />
    </div>
  )
})

AirTransferEnable.displayName = 'AirTrasferEnable'

export default AirTransferEnable
