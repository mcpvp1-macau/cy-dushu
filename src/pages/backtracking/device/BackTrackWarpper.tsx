import UavBackTracking from './uav'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const BackTrackCompMap = {
  UAV: UavBackTracking,
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
