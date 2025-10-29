import { memo, type FC } from 'react'
import BackTrackingVideo from '../BackTrackingVideo'
import InfoCard from './InfoCard'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import { DataTimeRange } from '../../dataTimeRange'

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

    const { t } = useTranslation()

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
        <section className="mx-3 mr-[9px] my-3 flex gap-2">
          <Link
            className="grow"
            to={`/backtracking/control-room/wanglou/${data.deviceId}`}
          >
            <Button block className="h-7" icon={<IconControlRoom />}>
              {t('device.enterControlRoom.title')}
            </Button>
          </Link>
        </section>
        <div className="my-2 px-3 text-xs flex items-center gap-2 text-white">
          <div className="w-[2px] h-[10px] bg-[#3DCC91]"></div>数据采集时间:{' '}
          {updateTime}
        </div>
        <div className="my-2 px-3 text-xs">
          <DataTimeRange deviceId={data.deviceId} />
        </div>
      </>
    )
  },
)

WanglouBackTrackingDetail.displayName = 'WanglouBackTrackingDetail'

export default WanglouBackTrackingDetail
