import PointCloudLayer from '@/components/PointCloudMap/PointCloudLayer'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { ThreeEvent } from '@react-three/fiber'
import { Html, OrthographicCamera } from '@react-three/drei'
import { Fragment } from 'react'
import { Vector3 } from 'three'
import PointActionMap from './components/PointActionMap'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import RebotDogLatestTask from './components/LatestTask'
import ThreeCanvas from '@/components/three/ThreeCanvas'
import PointActionDisplay from './components/PointActionDisplay'

const RebotDogMap: FC<unknown> = memo(() => {
  const x = useRebotDogControlRoomStore((s) => s.state.x || 0)
  const y = useRebotDogControlRoomStore((s) => s.state.y || 0)
  const z = useRebotDogControlRoomStore((s) => s.state.z || 0)
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)
  const pointAction = useRebotDogControlRoomStore((s) => s.pointAction)
  const updatePointAction = useRebotDogControlRoomStore(
    (s) => s.updatePointAction,
  )

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (!(event.nativeEvent.target instanceof HTMLCanvasElement)) {
      return
    }
    if (pointAction.open) {
      updatePointAction({
        open: true,
        targetPosition: [event.point.x, event.point.y, event.point.z],
        confirm: true,
      })
    }
  }

  return (
    <ThreeCanvas>
      <OrthographicCamera up={[0, 0, 1]} />
      <PointCloudLayer
        url={activeMapUrl || '/pcd_data/test (1).pcd'}
        meshProps={{ onClick }}
      />
      <RebotDogLatestTask />
      <Fragment>
        <Html position={new Vector3(x, y, z)} center zIndexRange={[100, 0]}>
          <div className="z-10" style={{ width: '24px', height: '24px' }}>
            <img src="/images/marker/icon/rebot_dog.svg" alt="" />
          </div>
        </Html>
        <Html position={new Vector3(x, y, z)} center>
          <div className="select-none font-bold mb-1 shadow-lg text-nowrap mt-14 text-xs">
            {deviceName}
          </div>
        </Html>
      </Fragment>

      <PointActionMap />
      <PointActionDisplay />
    </ThreeCanvas>
  )
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
