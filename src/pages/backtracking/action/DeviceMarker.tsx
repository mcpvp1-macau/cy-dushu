import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import BackTrackingPath from '../device/BackTrackingPath'
import DeviceMarkersBackTracking from './DeviceMarkersBackTracking'
import UavBackTrackingDetail from '../device/uav/UavDetail'
import useBackTrackingInfo from '../hooks/useBackTrackingInfo'
import { shouldJson } from '@/utils/json'
import { emtpyObject } from '@/constant/data'
import { getDeviceDetail } from '@/service/modules/device'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { memo, useMemo, useState } from 'react'
// import CallbackMarkers from './CallbackMarkers'

type PropsType = unknown

/**
 * 设备回溯坐标
 */
const DeviceMarker: React.FC<PropsType> = memo(() => {
  const childActions = useBackTrackingStore((s) => s.childActions)

  const deviceIds = useMemo(() => {
    const ids = childActions?.map((item) => item.deviceId || '') || []
    return [...new Set(ids)]
  }, [childActions])

  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', currentDeviceId],
      queryFn: () => getDeviceDetail(currentDeviceId!),
      enabled: !!currentDeviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const curAttr = useBackTrackingInfo(currentDeviceId)

  const properties = useMemo(() => {
    if (!currentDeviceId) return null
    return shouldJson(curAttr?.properties)?.[currentDeviceId]
  }, [currentDeviceId, curAttr?.properties])

  const ids = useMemo(() => {
    return deviceIds.filter((item) => item !== currentDeviceId)
  }, [deviceIds, currentDeviceId])


  return (
    <>
      {/** 除了打开了详情的设备 */}
      <DeviceMarkersBackTracking
        deviceIds={ids}
        onClick={(device) => setCurrentDeviceId(device.deviceId)}
        deviceId={currentDeviceId!}
      />
      {/* <CallbackMarkers
        deviceIds={ids}
        deviceId={currentDeviceId!}
        onClick={(device) => setCurrentDeviceId(device.deviceId)}
      /> */}
      {/** 打开了详情的设备 */}
      {currentDeviceId ? (
        <BackTrackingPath deviceId={currentDeviceId!} />
      ) : null}
      {isLoading || !data ? null : (
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
            onClose={() => setCurrentDeviceId(null)}
          />
        </>
      )}
    </>
  )
})

export default DeviceMarker
