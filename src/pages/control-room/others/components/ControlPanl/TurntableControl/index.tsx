
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import Control from '@/pages/right/DeviceDetail/OthersDetail/components/Control'
// import Control from '@/pages/right/DeviceDetail/WangLouDetail/components/Control'



/**
 * 转台控制
 * @returns
 */
const TurntableControl: React.FC = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const { deviceId: _deviceId, productKey: _productKey } = deviceDetail || {}
  // const isCameraChangePosition = useWangLouControlRoomStore(
  //   (s) => s.isCameraChangePosition,
  // )
  // const updateIsCameraChangePosition = useWangLouControlRoomStore(
  //   (s) => s.updateIsCameraChangePosition,
  // )
  // const hasControlPower = useWangLouControlRoomStore((s) => s.hasControlPower)

  // const enableSmartTrack = useWangLouControlRoomStore((s) => s.enableSmartTrack)
  // const updateEnableSmartTrack = useWangLouControlRoomStore((s) => s.updateEnableSmartTrack)

  return (
    <div>
      {/* <section className="mx-3 mr-[9px] my-3 flex gap-8 justify-center">
        <Button
          icon={<Icon id="icon-kuangxuan" />}
          disabled={!hasControlPower}
          onClick={() => {
            updateIsCameraChangePosition({
              deviceId: deviceId!,
              productKey: productKey!,
              enabled: !isCameraChangePosition?.enabled,
            })
          }}
        >
          指点定位
        </Button>
        <Button
          icon={<Icon id="icon-mubiaojiance" />}
          onClick={() => {
            updateEnableSmartTrack(!enableSmartTrack)
          }}
        >
          目标跟踪
        </Button>
      </section> */}
      {deviceDetail && <Control data={deviceDetail!} />}
    </div>
  )
}

export default TurntableControl
