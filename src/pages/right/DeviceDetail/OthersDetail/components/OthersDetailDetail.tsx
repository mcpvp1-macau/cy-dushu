import React from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import OthersVideo from './OthersVideo'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import ControlPower from '@/components/ControlPower'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import InfoCard from './InfoCard'
import Control from './Control'
import DeviceAlgorithmList from '@/components/device/algorithm/DeviceAlgorithmList'
import deviceConfigsMap from './deviceConfigsMap'
import RadarMap from './RadarMap/RadarMap'

const OthersDetailDetail: React.FC = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const deviceId = deviceDetail.deviceId
  const deviceType = deviceDetail.deviceType
  const deviceConfigs = deviceConfigsMap[deviceType] ?? deviceConfigsMap.default
  const productKey =
    deviceDetail.productKey || deviceDetail.deviceModel?.productKey
  const videoList = deviceDetail?.properties?.videoList
  const controlTag = useOthersControlRoomStore((s) => s.state.controlTag)
  const uuid = useOthersControlRoomStore((s) => s.uuid)
  const updateUUID = useOthersControlRoomStore((s) => s.updateUUID)
  const { t } = useTranslation()

  const childDeviceVideos = useMemo(() => {
    const arr: API_DEVICE.domain.Device[] = []
    deviceDetail?.childDevice?.forEach((item) => {
      if (item?.properties?.videoList?.length) arr.push(item)
    })
    return arr
  }, [deviceDetail?.childDevice])

  return (
    <div>
      {/** 设备本身的视频 */}
      {videoList?.map((item) => {
        return (
          <section className="mx-3 mb-3">
            <OthersVideo
              deviceId={deviceId}
              productKey={productKey!}
              videoId={item.videoId}
              videoName={item.name}
            />
          </section>
        )
      })}
      {/** 子设备本身的视频 */}
      {childDeviceVideos.map((item) => {
        return item.properties?.videoList?.map((video) => {
          return (
            <section className="mx-3 mb-3">
              <OthersVideo
                deviceId={item.deviceId}
                productKey={item.deviceModel.productKey}
                videoId={video.videoId}
                videoName={item.name || item.deviceName}
              />
            </section>
          )
        })
      })}

      {deviceType === 'RADAR' && <div className="mx-3 mb-3 h-[184px]"><RadarMap deviceId={deviceId} /></div>}
      {deviceConfigs.isHaveControlRoom ? (
        <section className="mx-3 mr-[9px] my-3 flex gap-2">
          <Link className="grow" to={`/control-room/others/${deviceId}`}>
            <Button block className="h-7" icon={<IconControlRoom />}>
              {t('device.enterControlRoom.title')}
            </Button>
          </Link>
          {deviceConfigs.isHaveControlPower ? (
            <ControlPower
              open={!!(uuid && uuid === controlTag)}
              updateUUID={updateUUID}
            />
          ) : null}
        </section>
      ) : null}

      <AppCollapse
        className="border-x-0 border-b-0"
        defaultActiveKey={['status', 'flight']}
        items={[
          {
            label: t('common.deviceStatus'),
            key: 'status',
            children: (
              <AppViewSuspense>
                <InfoCard data={deviceDetail} />
              </AppViewSuspense>
            ),
          },
          deviceConfigs.isHaveControl
            ? {
                label: t('ja-zhuan-tai-kong-zhi'),
                key: 'flight',
                children: (
                  <AppViewSuspense>
                    {/** // TODO 后续要确认一下怎么判断是否有转台控制 */}
                    <Control data={deviceDetail} />
                  </AppViewSuspense>
                ),
              }
            : null,
          deviceConfigs.isHaveAI
            ? {
                label: t('device.aiModel.title'),
                key: 'ai',
                children: (
                  <AppViewSuspense>
                    {/** // TODO 后续要确认一下怎么判断是否有AI 模型 */}
                    <DeviceAlgorithmList
                      deviceType={deviceDetail.deviceType}
                      deviceId={deviceId}
                      productKey={productKey!}
                    />
                  </AppViewSuspense>
                ),
              }
            : null,
        ].filter((item) => !!item)}
      />
    </div>
  )
}

export default React.memo(OthersDetailDetail)
