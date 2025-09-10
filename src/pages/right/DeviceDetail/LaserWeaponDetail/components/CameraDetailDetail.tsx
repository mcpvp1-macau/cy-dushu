import { ComponentRef, memo, type FC } from 'react'
import CameraDetailInfoCard from './CameraDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'

import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import LaserWeaponInfoCard from './CameraDetailInfoCard'

type PropsType = unknown

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { t } = useTranslation()
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

  console.info(deviceDetail)
  return (
    <div>
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
      <section className="mx-3"></section>
      <section className="mx-3 mr-[9px] my-3 flex gap-2">
        <Link className="grow" to={`/control-room/laser-weapon/${deviceId}`}>
          <Button block className="h-7" icon={<IconControlRoom />}>
            {t('device.enterControlRoom.title')}
          </Button>
        </Link>
      </section>
      <AppCollapse
        className="border-x-0 border-b-0"
        defaultActiveKey={['status']}
        items={[
          {
            label: '设备状态',
            key: 'status',
            children: (
              <AppViewSuspense>
                <div className="">
                  <LaserWeaponInfoCard
                    modelNumber={modelName}
                    onlineStatus={deviceDetail.status}
                    longitude={deviceDetail.longitude}
                    latitude={deviceDetail.latitude}
                    altitude={deviceDetail?.properties?.altitude}
                  />
                </div>
              </AppViewSuspense>
            ),
          },
          {
            label: '工作模式',
            key: 'mode',
            children: (
              <AppViewSuspense>
                <div className="flex justify-center my-3 items-center gap-10">
                  1`3`
                </div>
              </AppViewSuspense>
            ),
          },
        ].filter((item) => !!item)}
      />
    </div>
  )
})

CameraDetailDetail.displayName = 'CameraDetailDetail'

export default CameraDetailDetail
