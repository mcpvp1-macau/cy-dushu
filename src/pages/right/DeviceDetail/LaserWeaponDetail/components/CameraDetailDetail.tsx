import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import LaserWeaponInfoCard from './CameraDetailInfoCard'
import { Tabs } from 'antd'
import SearchRadarStatusInfo from '@/pages/control-room/laser-weapon/components/StatusInfo/SearchRadarStatusInfo'
import TrackingRadarStatusInfo from '@/pages/control-room/laser-weapon/components/StatusInfo/TrackingRadarStatusInfo'
import ElectroOpticalStatusInfo from '@/pages/control-room/laser-weapon/components/StatusInfo/ElectroOpticalStatusInfo'
import LaserStatusInfo from '@/pages/control-room/laser-weapon/components/StatusInfo/LaserStatusInfo'
import InfoItem from '@/pages/control-room/laser-weapon/components/StatusInfo/InfoItem'
import LinkSwitch from '@/components/LinkSwitch'

type PropsType = unknown

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { t } = useTranslation()
  const deviceId = deviceDetail.deviceId
  const productKey = (deviceDetail.productKey ||
    deviceDetail.deviceModel?.productKey)!
  const videoList = deviceDetail?.properties.videoList || []

  const modelName =
    deviceDetail.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const [videoSource1, setVideoSource1] = useState<string>(
    videoList?.[0]?.videoId,
  )
  const [videoSource2, setVideoSource2] = useState<string>(
    videoList?.[2]?.videoId,
  )
  const videoSourceOptions1 = [
    {
      label: videoList?.[0]?.name,
      value: videoList?.[0]?.videoId,
    },
    {
      label: videoList?.[1]?.name,
      value: videoList?.[1]?.videoId,
    },
  ]

  const videoSourceOptions2 = [
    {
      label: videoList?.[2]?.name,
      value: videoList?.[2]?.videoId,
    },
    {
      label: videoList?.[3]?.name,
      value: videoList?.[3]?.videoId,
    },
  ]

  return (
    <div>
      <section className="mx-3 mb-3">
        <DeviceLiveVideo
          deviceId={deviceId}
          productKey={productKey!}
          videoId={videoSource1 ?? ''}
          leftTop={
            <>
              <LinkSwitch
                items={videoSourceOptions1}
                value={videoSource1}
                onChange={setVideoSource1}
              />
            </>
          }
        />
      </section>

      <section className="mx-3 mb-3">
        <DeviceLiveVideo
          deviceId={deviceId}
          productKey={productKey!}
          videoId={videoSource2 ?? ''}
          leftTop={
            <>
              <LinkSwitch
                items={videoSourceOptions2}
                value={videoSource2}
                onChange={setVideoSource2}
              />
            </>
          }
        />
      </section>
      {/* {videoList.map((item) => {
        return (
          <section className="mx-3 mb-3" key={item.videoId}>
            <DeviceLiveVideo
              ref={videoRef}
              deviceId={deviceId}
              productKey={productKey!}
              videoId={item.videoId ?? ''}
              leftTop={<>{item.name}</>}
              rightTop={
                <VideoSnapshotBtn
                  productKey={productKey!}
                  deviceId={deviceId}
                  videoLiveRef={videoRef}
                />
              }
            />
          </section>
        )
      })} */}
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
        defaultActiveKey={['status', 'mode']}
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
                <div className="w-full">
                  <ul className="flex flex-wrap text-sm py-0 px-1 m-2">
                    <InfoItem name="workMode" label="工作模式" />
                    <InfoItem
                      name="laserDeviceWorkingStatus"
                      label="工作状态"
                    />
                  </ul>
                  <Tabs
                    defaultActiveKey="4"
                    tabPosition={'top'}
                    className="[&_.ant-tabs-nav]:pl-3"
                    items={[
                      // {
                      //   label: '火炮',
                      //   key: '3',
                      //   children: <ArtilleryStatusInfo />,
                      // },
                      {
                        label: '搜索雷达',
                        key: '4',
                        children: <SearchRadarStatusInfo />,
                      },
                      {
                        label: '跟踪雷达',
                        key: '5',
                        children: <TrackingRadarStatusInfo />,
                      },
                      {
                        label: '光电',
                        key: '6',
                        children: <ElectroOpticalStatusInfo />,
                      },
                      {
                        label: '激光',
                        key: '7',
                        children: <LaserStatusInfo />,
                      },
                    ]}
                  />
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
