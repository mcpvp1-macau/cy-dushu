import MapRealMarker from '@/components/map/device/WangLouModel'
import WangLouModel from '@/components/map/device/WangLouModel'
import Frustum from '@/map/GlobalMap/WaylineEdit/ActionAirline3D/UavPoint/Frustum'
import Radar from '@/map/GlobalMap/DeviceMarkers/WangLouMarkers/Radar'
import { shouldJson } from '@/utils/json'
import { GetProps } from 'antd'
import { Billboard, BillboardCollection, Label, LabelCollection } from 'resium'
import * as Cesium from 'cesium'
import wanglou from '/images/marker/icon/wanglou.svg'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'

type PropsType = Record<string, never>

type StateType =
  | (GetProps<typeof MapRealMarker>['data'] & {
      deviceId: string
      pitch: number
      yaw: number
      /** 红外 */
      INFRARED_CAMERA: any
      /** 可见光 */
      VISIBLE_LIGHT_CAMERA: any
      /** 振动仪 */
      VIBRATOR: any
      /** 雷达 */
      RADAR: any
    })
  | null

const WangLouDetailMarker: FC<PropsType> = memo(() => {
  // const [state, setState] = useState<StateType>(null)
  const data =
    useBackTrackingStore((s) => s.detail) || ({} as API_DEVICE.domain.Device)
  const currentAttribute = useBackTrackingStore((s) => s.currentAttribute)

  const properties = currentAttribute
    ? shouldJson(currentAttribute?.properties)
    : {}

  const state = useMemo(() => {
    if (!currentAttribute) {
      return null
    }
    let s = {}
    data?.childDevice?.forEach((item) => {
      const json = properties[item.deviceId]
      s[item.deviceType] = json
    })
    s = { ...s, ...properties[data?.deviceId] }

    return s
  }, [currentAttribute]) as StateType

  const lnglatData = {
    longitude: state?.longitude || data?.longitude || 120,
    latitude: state?.latitude || data?.latitude || 30,
    altitude: state?.altitude || 0,
  }

  const { longitude: lng, latitude: lat } = lnglatData

  return (
    <>
      <WangLouModel data={lnglatData} />
      {/** 可见光 */}
      {/* {state?.VISIBLE_LIGHT_CAMERA ? ( */}
      <Frustum
        position={[
          lnglatData.longitude,
          lnglatData.latitude,
          lnglatData.altitude + (state?.VISIBLE_LIGHT_CAMERA?.groundLift || 0),
        ]}
        rotation={{
          x: +(state?.pitch ?? 90),
          y: state?.yaw ?? 0,
          z: 0,
        }}
        aspectRatio={state?.VISIBLE_LIGHT_CAMERA?.aspectRatio || 16 / 9}
        color="#35C2A0"
        fov={state?.VISIBLE_LIGHT_CAMERA?.fov || 30}
        far={1000}
      />
      {/* ) : null} */}
      {/** 红外 */}
      {/* {state?.INFRARED_CAMERA ? ( */}
      <Frustum
        position={[
          lnglatData.longitude,
          lnglatData.latitude,
          lnglatData.altitude + (state?.INFRARED_CAMERA?.groundLift || 0),
        ]}
        rotation={{
          x: +(state?.pitch ?? 90),
          y: state?.yaw ?? 0,
          z: 0,
        }}
        aspectRatio={state?.INFRARED_CAMERA?.aspectRatio || 16 / 9}
        color="#f97316"
        fov={state?.INFRARED_CAMERA?.fov || 20}
        far={600}
      />
      {/* ) : null} */}
      {state?.RADAR?.scanRangeProfile ? (
        <>
          <Radar scanRangeProfile={state.RADAR?.scanRangeProfile} />
        </>
      ) : null}
      <BillboardCollection>
        <LabelCollection>
          <Billboard
            key={data.deviceId + '-backtracking'}
            id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}--backtracking`}
            position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
            image={wanglou}
            width={26}
            height={26}
            verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
            horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
            disableDepthTestDistance={50000}
            heightReference={Cesium.HeightReference.NONE}
          />
          <Label
            key={data.deviceId + '-label' + '-backtracking'}
            id={data.deviceId + '-label' + '-backtracking'}
            position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
            scale={0.1}
            verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
            horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
            text={data.deviceName}
            outlineColor={Cesium.Color.fromCssColorString('#000')}
            outlineWidth={5}
            font="700 128px Helvetica"
            pixelOffset={new Cesium.Cartesian2(0, 25)}
            backgroundColor={Cesium.Color.BLACK}
            fillColor={Cesium.Color.WHITE}
            backgroundPadding={new Cesium.Cartesian2(5, 5)}
            disableDepthTestDistance={50000}
            style={Cesium.LabelStyle.FILL_AND_OUTLINE}
            heightReference={Cesium.HeightReference.NONE}
            distanceDisplayCondition={
              new Cesium.DistanceDisplayCondition(0, 200_000)
            }
          />
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

WangLouDetailMarker.displayName = 'WangLouDetailMarker'

export default WangLouDetailMarker
