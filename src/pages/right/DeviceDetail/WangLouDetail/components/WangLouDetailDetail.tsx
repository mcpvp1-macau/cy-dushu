import { ComponentRef, memo, type FC } from 'react'
import WangLouDetailInfoCard from './WangLouDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import WangLouLiveVideo from './WangLouLiveVideo'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import ControlPower from '@/components/ControlPower'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import InfoCard from './InfoCard/InfoCard'
import DeviceAlgorithmList from '@/components/device/algorithm/DeviceAlgorithmList'
import { DeviceEnum } from '@/enum/device'
import Control from './Control'

type PropsType = unknown

const WangLouDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey =
    deviceDetail.productKey || deviceDetail.deviceModel?.productKey
  // const videoId = deviceDetail?.properties.videoList?.[0]?.videoId

  // const modelName =
  //   deviceDetail.deviceTags?.find(
  //     (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
  //   )?.tagValue || '-'
  const controlTag = useWangLouControlRoomStore((s) => s.state.controlTag)
  const uuid = useWangLouControlRoomStore((s) => s.uuid)
  const updateUUID = useWangLouControlRoomStore((s) => s.updateUUID)

  const lightCameraData = deviceDetail?.childDevice?.find(
    (item) => item.deviceType === 'VISIBLE_LIGHT_CAMERA',
  )

  const infraredCameraData = deviceDetail?.childDevice?.find(
    (item) => item.deviceType === 'INFRARED_CAMERA',
  )

  return (
    <div>
      {/* <section className="mx-3">
        <WangLouDetailInfoCard
          modelNumber={modelName}
          onlineStatus={deviceDetail.status}
          longitude={deviceDetail.longitude}
          latitude={deviceDetail.latitude}
        />
      </section> */}
      <section className="mx-3 my-3">
        {lightCameraData ? (
          <WangLouLiveVideo
            deviceId={lightCameraData?.deviceId}
            productKey={lightCameraData?.productKey}
            data={lightCameraData!}
          />
        ) : null}
      </section>

      <section className="mx-3 my-3">
        {infraredCameraData ? (
          <WangLouLiveVideo
            deviceId={infraredCameraData.deviceId}
            productKey={infraredCameraData.productKey!}
            data={infraredCameraData!}
          />
        ) : null}
      </section>
      <section className="mx-3 mr-[9px] my-3 flex gap-2">
        <Link className="grow" to={`/control-room/wanglou/${deviceId}`}>
          <Button block className="h-7" icon={<IconControlRoom />}>
            进入驾驶舱
          </Button>
        </Link>
        <ControlPower
          open={!!(uuid && uuid === controlTag)}
          updateUUID={updateUUID}
        />
      </section>
      <AppCollapse
        className="mt-3 border-x-0 border-b-0"
        defaultActiveKey={['status', 'flight']}
        items={[
          {
            label: '设备状态',
            key: 'status',
            children: (
              <AppViewSuspense>
                <InfoCard data={deviceDetail} />
              </AppViewSuspense>
            ),
          },
          {
            label: '转台控制',
            key: 'flight',
            children: (
              <AppViewSuspense>
                <Control data={deviceDetail} />
              </AppViewSuspense>
            ),
          },
          {
            label: 'AI 模型',
            key: 'ai',
            children: (
              <AppViewSuspense>
                <DeviceAlgorithmList
                  deviceType={DeviceEnum.WANGLOU}
                  deviceId={deviceId}
                  productKey={productKey!}
                />
              </AppViewSuspense>
            ),
          },
        ]}
      />
    </div>
  )
})

WangLouDetailDetail.displayName = 'WangLouDetailDetail'

export default WangLouDetailDetail
