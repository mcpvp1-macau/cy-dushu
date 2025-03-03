import { memo, type FC } from 'react'
import BackTrackingVideo from '../BackTrackingVideo'
import InfoCard from './InfoCard'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'

type PropsType = {
  data: API_DEVICE.domain.Device
  curAttr: Record<string, any>
  updateTime: string
}

const WanglouBackTrackingDetail: FC<PropsType> = memo(
  ({ data, curAttr, updateTime }) => {
    const lightCameraData = data?.childDevice?.find(
      (item) => item.deviceType === 'VISIBLE_LIGHT_CAMERA',
    )

    const infraredCameraData = data?.childDevice?.find(
      (item) => item.deviceType === 'INFRARED_CAMERA',
    )

    return (
      <>
        <div className="my-2 min-h-[200px]">
          <div className="absolute ml-[20px]">可见光</div>
          {lightCameraData ? (
            <BackTrackingVideo
              productKey={lightCameraData.deviceModel.productKey}
              deviceId={lightCameraData.deviceId}
              videoId={lightCameraData.videos?.[0]?.videoId}
            />
          ) : (
            <div className="text-center aspect-video bg-black m-[12px] pt-[30px]">
              <AppEmpty description="当前时段暂无视频" />
            </div>
          )}
        </div>
        <div className="my-2">
          <div className="absolute ml-[20px]">红外</div>
          {infraredCameraData ? (
            <BackTrackingVideo
              productKey={infraredCameraData.deviceModel.productKey}
              deviceId={infraredCameraData.deviceId}
              videoId={infraredCameraData.videos?.[0]?.videoId}
            />
          ) : null}
        </div>
        <AppCollapse
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: '属性状态',
              children: <InfoCard data={data} curAttr={curAttr} />,
            },
          ]}
        ></AppCollapse>

        <div className="my-2 px-3 text-xs text-center">
          数据时间: {updateTime}
        </div>
      </>
    )
  },
)

WanglouBackTrackingDetail.displayName = 'WanglouBackTrackingDetail'

export default WanglouBackTrackingDetail
