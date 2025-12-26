import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import VideoViewModal from '@/pages/sources/components/DeviceData/VideoViewModal'
import { Col, Pagination, Row } from 'antd'
import { Dayjs } from 'dayjs'
import useVideoList from '../../hooks/useVideoList'
import Select from '@/components/AntdOverride/Select'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
  deviceType: string
  timeRange?: [Dayjs, Dayjs]
}

const HistoryVideo: React.FC<PropsType> = memo(
  ({ timeRange, deviceList, deviceType }) => {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(() =>
      timeRange ?? [
        dayjs().startOf('day').startOf('minute'),
        dayjs().endOf('day').endOf('minute'),
      ],
    )

    useEffect(() => {
      if (timeRange) {
        setDateRange(timeRange)
      }
    }, [timeRange])

    const [type, setType] = useState<'platform' | 'device'>('platform')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(9)
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
      dateRange ?? ([dayjs().startOf('day'), dayjs().endOf('day')] as const),
    )

    // Reset page to 1 when filters change
    useEffect(() => {
      setPage(1)
    }, [type, deviceId, dateRange])

    // Calculate paginated data
    const paginatedVideoList = useMemo(() => {
      if (!videoList || videoList.length === 0) return []
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      return videoList.slice(startIndex, endIndex)
    }, [videoList, page, pageSize])

    return (
      <div>
        <div className="px-3 pt-3">
          <DateRangePicker
            className="w-full"
            showTime={{
              showSecond: false,
            }}
            value={dateRange}
            onChange={(s) => {
              if (!s) {
                setDateRange(null)
                return
              }
              setDateRange([
                s[0]!.startOf('minute'),
                s[1]!.endOf('day').endOf('minute'),
              ])
            }}
          />
        </div>
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
                ? paginatedVideoList.map((e) => (
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
                : paginatedVideoList.map((e) => (
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
            {videoList.length > 0 && (
              <div className="mt-1 flex justify-center">
                <Pagination
                  size="small"
                  current={page}
                  pageSize={pageSize}
                  total={videoList.length}
                  pageSizeOptions={Array.from(
                    { length: 8 },
                    (_, i) => (i + 1) * 9,
                  )}
                  onChange={(page, pageSize) => {
                    setPage(page)
                    setPageSize(pageSize)
                  }}
                />
              </div>
            )}
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
