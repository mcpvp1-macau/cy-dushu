import {
  getGlobalDeviceLocationRetrieval,
  getTrackQueryMultiDeviceV2,
} from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo, type FC } from 'react'
import {
  Billboard,
  BillboardCollection,
  Label,
  LabelCollection,
  useCesium,
} from 'resium'
import { attempt } from 'lodash'
import { deviceIconMap } from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/OtherMarker'
import useFly from '../hooks/useFly'
import { useEffect } from 'react'
import * as Cesium from 'cesium'
import CallbackMarker from './CallbackMarker'
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
}

const CallbackMarkers: React.FC<PropsType> = memo(
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
      <>
        {featureCollections.map((item) => (
          <CallbackMarker
            key={item.deviceId}
            lng={item.longitude}
            lat={item.latitude}
            name={item.deviceName}
            deviceId={item.deviceId}
            altitude={item.altitude}
          />
        ))}
      </>
    )
  },
)

export default CallbackMarkers
