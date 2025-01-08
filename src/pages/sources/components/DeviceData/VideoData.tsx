import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import VideoPreview from '@/components/VideoPreview'
import VideoPlayer from '@/components/VideoS/VideoPlayer'
import XModal from '@/components/XModal'
import { dft } from '@/constant/time-fmt'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getHistoryVideo } from '@/service/modules/device'
import { getVodUrl } from '@/service/modules/video'
import { Button, Col, DatePicker, Row, Select } from 'antd'
import { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

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

  const { videoId, productKey } = useMemo(() => {
    const device = deviceList.find((e) => e.deviceId === deviceId)!
    return {
      videoId: device.properties?.videoList?.[0]?.videoId,
      productKey: device.deviceModel?.productKey,
    }
  }, [deviceList, deviceId])

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, 'day').startOf('minute'),
    dayjs().endOf('minute'),
  ])

  const queryClient = useQueryClient()

  const { data: videoList, isLoading } = useQuery(
    {
      queryKey: [
        'getHistoryVideo',
        deviceId,
        `${dateRange?.[0].unix()}-${dateRange?.[1].unix()}`,
      ],
      queryFn: () =>
        getHistoryVideo(productKey, deviceId, videoId!, {
          startTime: dateRange![0].format(dft),
          endTime: dateRange![1].format(dft),
        }),
      enabled: !!videoId && !!dateRange,
      select: (d) => d.data.videoList,
    },
    queryClient,
  )

  const [activeVideo, setActiveVideo] =
    useState<API_DEVICE.domain.HistoryVideoListItem | null>(null)

  const msgApi = useAppMsg()
  const handleDownloadClick = async () => {
    if (activeVideo?.playUrl) {
      const resp = await getVodUrl(activeVideo?.playUrl)
      if (resp.data?.location) {
        msgApi.info('正在下载视频, 请稍候~')
        let url = resp.data.location + '&proxy=true'
        if (globalConfig.vodVideoUrl) {
          url = url.replace(globalConfig.vodVideoUrl, '')
        }
        window.open(url, 'download')
      } else {
        msgApi.error(resp.message)
      }
    } else {
      msgApi.error('play url is not exist')
    }
  }

  return (
    <div>
      <div className="py-3 flex gap-2">
        <RangePicker
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
      </div>
      <div>
        {isLoading ? (
          <AppSpin />
        ) : !videoList || videoList.length === 0 ? (
          <AppEmpty className="my-10" />
        ) : (
          <div className="max-h-[460px] overflow-x-hidden overflow-y-auto">
            <Row className="mb-3" gutter={[8, 8]}>
              {videoList.map((e) => (
                <Col span={24} md={12} lg={8} key={e.playUrl}>
                  <VideoPreview
                    previewSrc={`/storage/${e.previewUrl}`}
                    info={
                      <p>
                        <span>{e.timeRange[0]}</span>-
                        <span>{e.timeRange[1]}</span>
                      </p>
                    }
                    onClick={() => setActiveVideo(e)}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
      {activeVideo && (
        <XModal
          title={
            <>
              {`历史视频 ${activeVideo.timeRange[0]} - ${activeVideo.timeRange[1]}`}
              <Button type="link" onClick={handleDownloadClick}>
                下载
              </Button>
            </>
          }
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

VideoData.displayName = 'VideoData'

export default VideoData
