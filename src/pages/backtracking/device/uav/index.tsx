import UavBackTrackingDetail from './UavDetail'
import { emtpyObject } from '@/constant/data'
import { shouldJson } from '@/utils/json'
import useBackTrackingInfo from '../../hooks/useBackTrackingInfo'
import BackTrackingPath from '../BackTrackingPath'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/**
 * 无人机回溯
 */
const UavBackTracking: React.FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data
  const curAttr = useBackTrackingInfo(deviceId)

  const properties = useMemo(() => {
    return shouldJson(curAttr?.properties)?.[deviceId]
  }, [deviceId, curAttr?.properties])
  return (
    <>
      <UavBackTrackingDetail
        data={data}
        state={properties ?? emtpyObject}
        updateTime={
          (curAttr?.acquireTimestampFormat &&
            dayjs(curAttr?.acquireTimestampFormat).format(
              'YYYY-MM-DD HH:mm:ss',
            )) ||
          '-'
        }
      />

      <BackTrackingPath deviceId={deviceId} />
    </>
  )
})

export default UavBackTracking
