import { getGlobalDeviceLocationRetrieval } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { memo, useMemo, type FC } from 'react'
import { Billboard, BillboardCollection, Label, LabelCollection } from 'resium'
import * as Cesium from 'cesium'
import { deviceIconMap } from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/OtherMarker'
import useFly from '../hooks/useFly'
import { useRequest } from 'ahooks'

type PropsType = {
  deviceId?: string
  deviceIds: string[]
  onClick: (device: DeviceBackItem) => void
}

type DeviceBackItem = {
  deviceType: any
  longitude: number
  latitude: number
  deviceId: string
  deviceName: string
  name: string
  type: string
  altitude?: number
}

/**
 * 无人机设备回溯
 */
const DeviceMarkersBackTracking: FC<PropsType> = memo(
  ({ deviceId, deviceIds, onClick }) => {
    const dataTime = useBackTrackingStore((s) =>
      s.currentTime.format('YYYY-MM-DD HH:mm:ss'),
    )
    const startTime = useBackTrackingStore((s) =>
      s.timeRange[0].format('YYYY-MM-DD HH:mm:ss'),
    )
    const { data, run } = useRequest(
      async () => {
        const res = await getGlobalDeviceLocationRetrieval({
          deviceIdArrays: deviceIds,
          startTime: startTime,
          endTime: dataTime,
        })
        return res.data || []
      },
      { manual: true },
    )

    const featureCollections = useMemo(
      () =>
        data
          // 过滤掉当前设备，由轨迹展示
          ?.filter((item: DeviceBackItem) => item.deviceId !== deviceId) || [],
      [data, deviceId],
    )

    useFly(data?.[0])

    useEffect(() => {
      deviceIds.length && run()
    }, [deviceIds, startTime, dataTime])


    return (
      <BillboardCollection>
        <LabelCollection>
          {(deviceIds.length ? featureCollections : [])
            .filter((item: DeviceBackItem) => deviceId !== item.deviceId)
            .map((item: DeviceBackItem) => {
              const {
                longitude: lng,
                latitude: lat,
                name,
                type,
                deviceId,
              } = item
              const icon = deviceIconMap['UAV']
              return (
                <>
                  <Billboard
                    key={deviceId}
                    id={`device--${type}--${name}--${deviceId}--${lng}--${lat}`}
                    position={Cesium.Cartesian3.fromDegrees(
                      lng || 120,
                      lat || 30,
                      item.altitude || 0,
                    )}
                    image={icon}
                    width={26}
                    height={26}
                    disableDepthTestDistance={50000}
                    heightReference={Cesium.HeightReference.NONE}
                    onClick={() => onClick(item)}
                  />
                  <Label
                    key={deviceId + '-label'}
                    id={deviceId + '-label'}
                    position={Cesium.Cartesian3.fromDegrees(
                      lng || 120,
                      lat || 30,
                      item.altitude || 0,
                    )}
                    scale={0.1}
                    verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
                    horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
                    text={name}
                    outlineColor={Cesium.Color.fromCssColorString('#000')}
                    outlineWidth={5}
                    font="700 128px Helvetica"
                    pixelOffset={new Cesium.Cartesian2(0, 32)}
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
                </>
              )
            })}
        </LabelCollection>
      </BillboardCollection>
    )
  },
)

DeviceMarkersBackTracking.displayName = 'DeviceMarkersBackTracking'

export default DeviceMarkersBackTracking
