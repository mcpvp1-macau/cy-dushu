import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import VideoViewModal from '@/pages/sources/components/DeviceData/VideoViewModal'
import { Col, Row } from 'antd'
import { Dayjs } from 'dayjs'
import useVideoList from '../../hooks/useVideoList'
import Select from '@/components/AntdOverride/Select'
import { handleStorageURL } from '@/pages/events/components/EventDetail'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
  deviceType: string
  timeRange?: [Dayjs, Dayjs]
}

const HistoryVideo: React.FC<PropsType> = memo(
  ({ timeRange, deviceList, deviceType }) => {
    const [type, setType] = useState<'platform' | 'device'>('platform')
    const [activeVideo, setActiveVideo] = useState<{
      isDevice?: boolean
      playUrl: string
      startTime: string
      endTime: string
    } | null>(null)
    const deviceOptions = useMemo(
      () =>
        deviceList.map((e) => ({
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
      type,
      videoId!,
      timeRange ?? ([dayjs().subtract(1000, 'day'), dayjs()] as const),
    )

    return (
      <div>
        <section className="m-3 flex gap-2">
          <div className="flex-1">
            <Select
              className="w-full"
              options={[
                { label: '平台录像', value: 'platform' },
                { label: '机身视频', value: 'device' },
              ]}
              value={type}
              onChange={setType}
            />
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
              {type === 'platform'
                ? videoList.map((e) => (
                    <Col span={8} key={e.playUrl}>
                      <VideoPreview
                        size="small"
                        previewSrc={`/storage/${e.previewUrl}`}
                        videoUrl={e.playUrl}
                        isAutoSrc={!e.previewUrl}
                        info={
                          <p className="flex gap-1">
                            <span>
                              {dayjs(e.timeRange[0])?.format('HH:mm')}
                            </span>
                            -
                            <span>
                              {dayjs(e.timeRange[1])?.format('HH:mm')}
                            </span>
                          </p>
                        }
                        onClick={() =>
                          setActiveVideo({
                            playUrl: e.playUrl,
                            startTime: e.timeRange[0],
                            endTime: e.timeRange[1],
                          })
                        }
                      />
                    </Col>
                  ))
                : videoList.map((e) => (
                    <Col span={8} key={e.id}>
                      <VideoPreview
                        size="small"
                        // previewSrc={`/storage/${e.previewUrl}`}
                        videoUrl={handleStorageURL(e.url)}
                        // isAutoSrc={!e.previewUrl}
                        info={
                          <p className="flex gap-1">
                            <span>{dayjs(e.startTime)?.format('HH:mm')}</span>-
                            <span>{dayjs(e.endTime)?.format('HH:mm')}</span>
                          </p>
                        }
                        onClick={() =>
                          setActiveVideo({
                            isDevice: true,
                            playUrl: handleStorageURL(e.url),
                            startTime: e.startTime,
                            endTime: e.endTime,
                          })
                        }
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
