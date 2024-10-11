import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import VideoPlayer from '@/components/VideoS/VideoPlayer'
import XModal from '@/components/XModal'
import { dateOnly, dft } from '@/constant/time-fmt'
import { getHistoryVideo } from '@/service/modules/device'
import { Col, DatePicker, Row } from 'antd'
import Select from 'antd/es/select'
import { memo, type FC } from 'react'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

/** 详情历史视频 */
const DeviceDetailMediaHistoryVideo: FC<PropsType> = memo(({ deviceList }) => {
  const [date, setDate] = useState(dayjs())
  const deviceOptions = useMemo(
    () =>
      deviceList.map((e) => ({
        label: e.name,
        value: e.deviceId,
      })),
    deviceList,
  )
  const [deviceId, setDeviceId] = useState(deviceList[0]?.deviceId)
  const { videoId, productKey } = useMemo(() => {
    const device = deviceList.find((e) => e.deviceId === deviceId)!
    return {
      videoId: device.properties?.videoList?.[0]?.videoId,
      productKey: device.deviceModel.productKey,
    }
  }, [deviceList, deviceId])

  const queryClient = useQueryClient()

  const { data: videoList, isLoading } = useQuery(
    {
      queryKey: ['getHistoryVideo', deviceId, `${date.format(dateOnly)}`],
      queryFn: () =>
        getHistoryVideo(productKey, deviceId, videoId!, {
          startTime: date.startOf('day').format(dft),
          endTime: date.endOf('day').format(dft),
        }),
      enabled: !!videoId,
      select: (d) => d.data.videoList,
    },
    queryClient,
  )

  const [activeVideo, setActiveVideo] =
    useState<API_DEVICE.domain.HistoryVideoListItem | null>(null)

  return (
    <div className="p-3">
      <section className="flex gap-2">
        <DatePicker className="w-36" value={date} onChange={setDate} />
        <Select
          className="flex-1"
          value={deviceId}
          options={deviceOptions}
          onChange={setDeviceId}
        />
      </section>
      {isLoading || !videoList ? (
        <AppSpin />
      ) : videoList.length === 0 ? (
        <AppEmpty />
      ) : (
        <div className="mt-3 overflow-x-hidden overflow-y-auto">
          <Row gutter={[8, 8]}>
            {videoList.map((e) => (
              <Col span={8} key={e.playUrl}>
                <VideoPreview
                  size="small"
                  previewSrc={`/storage/${e.previewUrl}`}
                  info={
                    <p className="flex gap-1">
                      <span>{dayjs(e.timeRange[0]).format('HH:mm')}</span>-
                      <span>{dayjs(e.timeRange[1]).format('HH:mm')}</span>
                    </p>
                  }
                  onClick={() => setActiveVideo(e)}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}
      {activeVideo && (
        <XModal
          title={`历史视频 ${activeVideo.timeRange[0]} - ${activeVideo.timeRange[1]}`}
          open={!!activeVideo}
          footer={false}
          width={800}
          noPadding
          onClose={() => setActiveVideo(null)}
        >
          <VideoPlayer src={activeVideo.playUrl} />
        </XModal>
      )}
    </div>
  )
})

DeviceDetailMediaHistoryVideo.displayName = 'UavDetailMediaHistoryVideo'

export default DeviceDetailMediaHistoryVideo
