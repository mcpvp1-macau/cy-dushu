import { lazy } from 'react'

const UavBackTracking = lazy(() => import('./uav'))
const WanglouBackTracking = lazy(() => import('./wanglou'))

type PropsType = {
  data: API_DEVICE.domain.Device
}

const BackTrackCompMap = {
  UAV: UavBackTracking,
  WANGLOU: WanglouBackTracking,
}
const BackTrackWarpper: React.FC<PropsType> = memo(({ data }) => {
  const Comp = useMemo(
    () => BackTrackCompMap[data.deviceType],
    [data.deviceType],
  )
  return (
    <>
      <Comp data={data} />
    </>
  )
})

export default BackTrackWarpper
