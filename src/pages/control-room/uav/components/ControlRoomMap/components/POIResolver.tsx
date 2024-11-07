import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { isNil } from 'lodash'
import {
  Billboard,
  BillboardCollection,
  Label,
  LabelCollection,
  useCesium,
} from 'resium'
import point from '@/assets/marker/point.png'
import * as Cesium from 'cesium'
import PositionMenu from '@/components/map/PositionMenu'
import { ComponentRef } from 'react'
import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

/** POI 定位处理 */
const UAVControlRoomPOIResolver: FC<PropsType> = memo(() => {
  const activePOI = useMapLayerAndOverlayStore((s) => s.activePOI)
  const { viewer } = useCesium()

  const menuRef = useRef<ComponentRef<typeof PositionMenu>>(null)

  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)

  const canPointFly =
    !isLimitedFly && hasControlPower && serviceHave['gotoPosition']

  useEffect(() => {
    if (!activePOI || !viewer?.camera) {
      return
    }

    if (isNil(activePOI.lng) || isNil(activePOI.lat)) {
      return
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        activePOI.lng,
        activePOI.lat,
        1000,
      ),
      duration: 1,
    })
  }, [activePOI])

  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  if (!activePOI) {
    return null
  }

  return (
    <BillboardCollection>
      <LabelCollection>
        <Billboard
          key={activePOI.placeId}
          id={`poi--${activePOI.placeId}`}
          position={Cesium.Cartesian3.fromDegrees(
            activePOI.lng || 120,
            activePOI.lat || 30,
          )}
          image={point}
          width={32}
          height={32}
          verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          disableDepthTestDistance={50000}
          heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
          onClick={() => menuRef.current?.open()}
        />
        <Label
          key={activePOI.name + '-label'}
          id={activePOI.name + '-label'}
          position={Cesium.Cartesian3.fromDegrees(
            activePOI.lng || 120,
            activePOI.lat || 30,
          )}
          scale={0.1}
          verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          text={activePOI.displayName ?? activePOI.name ?? ''}
          outlineColor={Cesium.Color.fromCssColorString('#000')}
          outlineWidth={5}
          font="700 128px Helvetica"
          pixelOffset={new Cesium.Cartesian2(0, 16)}
          backgroundColor={Cesium.Color.BLACK}
          fillColor={Cesium.Color.WHITE}
          backgroundPadding={new Cesium.Cartesian2(5, 5)}
          disableDepthTestDistance={50000}
          style={Cesium.LabelStyle.FILL_AND_OUTLINE}
          heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
          distanceDisplayCondition={
            new Cesium.DistanceDisplayCondition(0, 500_000)
          }
          onClick={() => menuRef.current?.open()}
        />
        <PositionMenu
          ref={menuRef}
          position={[activePOI.lng, activePOI.lat]}
          menu={{
            items: [
              {
                label: '指点飞行',
                key: 'position',
                icon: <IconPointFly />,
                disabled: !canPointFly,
                onClick: () => {
                  updatePointFly({
                    open: true,
                    targetPosition: [activePOI.lng, activePOI.lat],
                  })
                  menuRef.current?.close()
                },
              },
            ],
          }}
        ></PositionMenu>
      </LabelCollection>
    </BillboardCollection>
  )
})

UAVControlRoomPOIResolver.displayName = 'UAVControlRoomPOIResolver'

export default UAVControlRoomPOIResolver
