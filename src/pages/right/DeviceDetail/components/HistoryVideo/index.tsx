import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import VideoViewModal from '@/pages/sources/components/DeviceData/VideoViewModal'
import { Col, DatePicker, Row } from 'antd'
import Select from 'antd/es/select'
import { Dayjs } from 'dayjs'
import useVideoList from '../../hooks/useVideoList'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
  deviceType: string
  timeRange?: [Dayjs, Dayjs]
}

const HistoryVideo: React.FC<PropsType> = memo(
  ({ timeRange, deviceList, deviceType }) => {
    const [date, setDate] = useState<Dayjs | null>(dayjs())
    const [activeVideo, setActiveVideo] =
      useState<API_DEVICE.domain.HistoryVideoListItem | null>(null)
    const deviceOptions = useMemo(
      () =>
        deviceList
          .filter((item) => !!item.properties.videoList)
          .map((e) => ({
            label: e.name,
            value: e.deviceId,
          })),
      deviceList,
    )
    const [deviceId, setDeviceId] = useState(deviceOptions?.[0]?.value)
    const { videoId, productKey } = useMemo(() => {
      const device = deviceList.find((e) => e.deviceId === deviceId)
      return {
        videoId: device?.properties?.videoList?.[0]?.videoId,
        productKey: device?.deviceModel?.productKey,
      }
    }, [deviceList, deviceId])

    const { videoList, isLoading } = useVideoList(
      productKey!,
      deviceId,
      deviceType,
      videoId!,
      timeRange || date,
    )

    return (
      <div>
        <section className="m-3 flex gap-2">
          <div className="flex-1">
            <DatePicker className="w-full" value={date} onChange={setDate} />
          </div>
          <div className="flex-1">
            <Select
              className="w-full"
              value={deviceId}
              options={deviceOptions}
              onChange={setDeviceId}
            />
          </div>
        </section>
        {isLoading ? (
          <AppSpin />
        ) : !videoList || videoList.length === 0 ? (
          <AppEmpty />
        ) : (
          <div className="m-3 overflow-x-hidden overflow-y-auto">
            <Row gutter={[8, 8]}>
              {videoList.map((e) => (
                <Col span={8} key={e.playUrl}>
                  <VideoPreview
                    size="small"
                    previewSrc={`/storage/${e.previewUrl}`}
                    info={
                      <p className="flex gap-1">
                        <span>{dayjs(e.timeRange[0])?.format('HH:mm')}</span>-
                        <span>{dayjs(e.timeRange[1])?.format('HH:mm')}</span>
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
          <VideoViewModal
            data={activeVideo}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </div>
    )
  },
)

export default HistoryVideo
