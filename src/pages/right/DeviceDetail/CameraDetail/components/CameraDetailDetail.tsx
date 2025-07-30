import { ComponentRef, memo, type FC } from 'react'
import CameraDetailInfoCard from './CameraDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import ControlBar from '../../OthersDetail/components/Control/ControlBar'

import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import { useRafInterval } from 'ahooks'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import ZoomControl from './ZoomControl'

type PropsType = unknown

const speed = 90

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey = (deviceDetail.productKey ||
    deviceDetail.deviceModel?.productKey)!
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId

  const services = deviceDetail.deviceModel?.services

  const modelName =
    deviceDetail.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

  console.log('deviceDetail', deviceDetail)

  const isHaveGimbal = !!services?.['moveGimbal']
  console.log('isHaveGimbal', isHaveGimbal)

  const [downKey, setDownKey] = useState<Record<string, number> | null>(null)

  const sendCommand = useOthersControlRoomStore((s) => s.sendCommand)

  useRafInterval(
    () => {
      sendCommand('service.moveGimbal.post', downKey)
    },
    downKey ? 60 : undefined,
  )

  return (
    <div>
      <section className="mx-3">
        <CameraDetailInfoCard
          modelNumber={modelName}
          onlineStatus={deviceDetail.status}
          longitude={deviceDetail.longitude}
          latitude={deviceDetail.latitude}
        />
      </section>
      <section className="mx-3 my-3">
        <DeviceLiveVideo
          ref={videoRef}
          deviceId={deviceId}
          productKey={productKey!}
          videoId={videoId ?? ''}
          rightTop={
            <VideoSnapshotBtn
              productKey={productKey!}
              deviceId={deviceId}
              videoLiveRef={videoRef}
            />
          }
        />
      </section>
      {isHaveGimbal && (
        <AppCollapse
          className="border-x-0 border-b-0"
          defaultActiveKey={['status']}
          items={[
            {
              label: '云台控制',
              key: 'status',
              children: (
                <AppViewSuspense>
                  <div className="flex justify-center my-3 items-center gap-10">
                    <ControlBar speed={speed} setDownKey={setDownKey} />
                    <ZoomControl item={deviceDetail} />
                  </div>
                </AppViewSuspense>
              ),
            },
          ].filter((item) => !!item)}
        />
      )}
    </div>
  )
})

CameraDetailDetail.displayName = 'CameraDetailDetail'

export default CameraDetailDetail
