import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import { Col, Row } from 'antd'
import { Dayjs } from 'dayjs'
import VideoViewModal from './VideoViewModal'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'
import Select from '@/components/AntdOverride/Select'
import useVideoList from '@/pages/right/DeviceDetail/hooks/useVideoList'
import { handleStorageURL } from '@/pages/events/components/EventDetail'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

const VideoData: FC<PropsType> = memo(({ deviceList }) => {
  const deviceOptions = useMemo(
    () =>
      deviceList.map((e) => ({
        label: e.name,
        value: e.deviceId,
      })),
    deviceList,
  )

  const [deviceId, setDeviceId] = useState<string>(deviceList[0]?.deviceId)

  const { videoId, productKey, deviceType } = useMemo(() => {
    const device = deviceList.find((e) => e.deviceId === deviceId)!
    return {
      videoId: device.properties?.videoList?.[0]?.videoId,
      productKey: device.deviceModel?.productKey,
      deviceType: device.deviceType,
    }
  }, [deviceList, deviceId])

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, 'day').startOf('minute'),
    dayjs().endOf('minute'),
  ])

  const [type, setType] = useState<'platform' | 'device'>('platform')

  const { videoList, isLoading } = useVideoList(
    productKey!,
    deviceId,
    deviceType,
    type,
    videoId!,
    dateRange ?? ([dayjs().subtract(1000, 'day'), dayjs()] as const),
  )

  const [activeVideo, setActiveVideo] = useState<{
    isDevice?: boolean
    playUrl: string
    startTime: string
    endTime: string
  } | null>(null)

  return (
    <div>
      <div className="py-3 flex gap-2">
        <DateRangePicker
          showTime={{
            showSecond: false,
          }}
          value={dateRange}
          onChange={(s) => {
            if (!s) {
              setDateRange(null)
            } else {
              setDateRange([
                s[0]!.startOf('minute'),
                s[1]!.endOf('day').endOf('minute'),
              ])
            }
          }}
        />
        <Select
          value={deviceId}
          className="w-56"
          options={deviceOptions}
          onChange={setDeviceId}
        />
        <Select
          className="w-40"
          options={[
            { label: '平台录像', value: 'platform' },
            { label: '机身视频', value: 'device' },
          ]}
          value={type}
          onChange={setType}
        />
      </div>
      <div>
        {isLoading ? (
          <AppSpin />
        ) : !videoList || videoList.length === 0 ? (
          <AppEmpty className="my-10" />
        ) : (
          <div className="max-h-[460px] overflow-x-hidden overflow-y-auto">
            <Row className="mb-3" gutter={[8, 8]}>
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
      </div>
      {activeVideo && (
        <VideoViewModal
          data={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  )
})

VideoData.displayName = 'VideoData'

export default VideoData
