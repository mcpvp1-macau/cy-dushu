import {
  getDeviceStreamList,
  live,
  setLiveQuality,
} from '@/service/modules/device/device-video'
import Jessibuca from '../Video/Jessibuca'
import { formatTs } from '@/utils/time'
import IconButton from '../ui/button/IconButton'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconFull from '@/assets/icons/jsx/IconFull'
import {
  useFullscreen,
  useInterval,
  useLatest,
  useSize,
  useThrottleFn,
} from 'ahooks'
import {
  DisconnectOutlined,
  ExpandOutlined,
  FullscreenExitOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { forwardRef, useImperativeHandle } from 'react'
import { calcStreamId } from '@/utils/video/stream'
import { getStreamQualityLevel } from '@/service/modules/video'
import VideoQuality5G from './components/VideoQuality5G'
import VideoQualityDRC from './components/VideoQualityDRC'
import { isNil } from 'lodash'
import SeiAIData from './components/SeiAIData'
import DrawBox from '../DrawBox'
import useElectricScale from './hooks/useElectricScale'
import { PropertiesData } from '../Video/Jessibuca/sei-types/properties'
import VideoStream from './components/VideoStream'
import { ConfigProvider } from 'antd'
import useCalcSafeArea from './hooks/useCalcSafeArea'
import VideoDing from './components/VideoDing'
import { AiObject } from '../Video/Jessibuca/sei-types/ai-data'
import useAIDataState from './hooks/useAIDataState'
import DaoTongPlayer from '../Video/DaoTongPlayer'
import SeiAIDataMetaInfo from './components/SeiAIDataMetaInfo'
import { Responses } from '@/service/servers/liqunAxios'
import useSnapshot from './hooks/useSnapshot'
import ShareQRCode from './ShareQRCode'
import useUpdateProjectedVideo from './hooks/useUpdateProjectedVideo'

type PropsType = {
  videoContainerId?: string
  productKey: string
  deviceId: string
  videoId: string
  sn?: string
  useTopBar?: boolean
  useBottomBar?: boolean
  // 需要决定位置传递 flex 的 order
  leftTop?: ReactNode
  leftBottom?: ReactNode
  rightTop?: ReactNode
  rightBottom?: ReactNode
  videoChildren?: ReactNode
  /** 区别于 videoChildren, 内容不会被工具栏挡住, 例如视频画框等操作请不要在这, 百分比是不对的 */
  videoSafeAreaChildren?: ReactNode
  wrapperChildren?: ReactNode
  useVideoQualityCheck?: {
    open?: boolean
    valueDRC?: number | string
    onDRCChange?: (quality: string) => void
  }
  useDing?: boolean
  renderVideo?: boolean
  /** 更新投影视频 */
  updateProjectedVideo?: boolean
  onAspectRatioChange?: (aspectRatio: number) => void
  onUavProperties?: (properties: PropertiesData) => void
  onClickSeiBox?: (box: AiObject) => void
  onVideoElementChange?: (videoElement: HTMLVideoElement | null) => void
}

type DeviceLiveVideoRefType = {
  /** 截图 */
  snapshot: (mediaTypes?: string, quality?: any) => string
  /** 获取当前帧解析到的 AI 数据 */
  getAiData: () => AiDataSnapshot
}

type AiDataSnapshot = ReturnType<typeof useAIDataState>[0]

function isDomainOrIP() {
  const hostname = window.location.hostname
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(hostname) ? 'IP' : 'Domain'
}

/** 设备直播 */
const DeviceLiveVideo = memo(
  forwardRef<DeviceLiveVideoRefType, PropsType>(
    (
      {
        videoContainerId,
        productKey,
        deviceId,
        videoId,
        sn,
        useTopBar = true,
        useBottomBar = true,
        leftBottom,
        leftTop,
        rightBottom,
        rightTop,
        videoChildren,
        videoSafeAreaChildren,
        wrapperChildren,
        useVideoQualityCheck,
        useDing = true,
        renderVideo = true,
        updateProjectedVideo = false,
        onAspectRatioChange,
        onUavProperties,
        onClickSeiBox,
        onVideoElementChange,
      },
      ref,
    ) => {
      const { t } = useTranslation()
      const queryClient = useQueryClient()

      const [errMsg, setErrMsg] = useState('')

      const LastUrlRef = useRef('')
      // 获取设备视频流列表
      const deviceStreamListCache = useRef<
        Awaited<ReturnType<typeof getDeviceStreamList>>['data'] | null
      >(null)

      const fetchDeviceStreamList = async () => {
        if (deviceStreamListCache.current) {
          return deviceStreamListCache.current
        }
        try {
          const res = await getDeviceStreamList({
            streamId: `${productKey}/${deviceId}`,
          })
          deviceStreamListCache.current = res.data
        } catch (error) {}
        return deviceStreamListCache.current
      }

      // 重新拉流的时间戳
      const [fetchTime, setFetchTime] = useState(0)
      const { data, refetch } = useQuery(
        {
          queryKey: ['getVideoUrl', { productKey, deviceId, videoId }],
          enabled: !!deviceId,
          queryFn: async () => {
            try {
              // 同时获取视频直播地址和流列表
              const [liveData, streamList] = await Promise.all([
                live(productKey, deviceId, { videoId }),
                fetchDeviceStreamList(), // 为了保证第一次拉流时, 能记住上一次选择的视频流, 所以一起请求
              ])

              let url = (liveData.data.playUrl as string) || ''

              // 记忆化获取上次的流
              const last = sessionStorage.getItem(deviceId + '-videoURL')
              if (last) {
                const find = streamList?.find((e) => e.playUrl === last)
                if (find) {
                  url = find.playUrl
                }
              }
              if (LastUrlRef.current !== url) {
                LastUrlRef.current = url
                setFetchTime(Date.now())
              }
              if (!url) {
                return data
              }
              setErrMsg('')
              return {
                url,
                streamList: streamList,
              }
            } catch (error) {
              const res = error as Responses<any>['common']
              console.error(res?.message)
              if (res?.code === 'ERROR') {
                if (res.message === 'device is offline') {
                  // 设备离线
                  setErrMsg('设备已离线')
                } else {
                  // 其他异常暂不提示
                }
              }
              LastUrlRef.current = ''
              return data ?? { url: '', streamList: [] }
            }
          },
        },
        queryClient,
      )

      const [jessibucaKey, setJessibucaKey] = useState(0)
      const playUrl = data?.url
      const streamList = data?.streamList

      const [url, setUrl] = useState(playUrl ?? '')

      useEffect(() => {
        setUrl(playUrl ?? '')
      }, [playUrl])

      const [aspectRatio, setAspectRatio] = useState(16 / 9)
      const [ts, _setTs] = useState(0)
      const tsUpdateTime = useRef(0)
      const { run: setTs } = useThrottleFn(
        (t: number) => {
          _setTs(t)
          tsUpdateTime.current = Date.now()
        },
        { wait: 333 },
      )

      /** 手动点击刷新 */
      const handleRefresh = async () => {
        await refetch()
      }

      const wrapperRef = useRef<HTMLDivElement>(null)
      const [fullScreen, { toggleFullscreen }] = useFullscreen(wrapperRef)

      const videoBoxRef = useRef<HTMLDivElement>(null)
      const size = useSize(videoBoxRef)

      /** 截图 */
      const snapshot = useSnapshot(wrapperRef)

      const streamId = useMemo(
        () => playUrl && calcStreamId(playUrl),
        [playUrl],
      )

      // 查询视频质量
      const { data: videoQuality } = useQuery(
        {
          queryKey: ['getLiveQuality', 'rtp', streamId],
          enabled: !!useVideoQualityCheck?.open && !!streamId,
          refetchInterval: 5_000,
          queryFn: () => getStreamQualityLevel({ app: 'rtp', streamId }),
          select: (d) => d.data.quality,
        },
        queryClient,
      )

      // 电子放大
      const {
        enableScale,
        originCenter,
        tranformCss,
        handleDrewScaleEnd,
        setEnableScale,
      } = useElectricScale(fullScreen)

      /** 视频流切换 */
      const handleStreamChange = useMemoizedFn((value: string) => {
        if (url.indexOf('?') > -1) {
          value += url.substring(url.indexOf('?'))
        }
        setUrl(value)
      })

      /** 视频质量切换 */
      const handle5GChange = useMemoizedFn(async (value: string) => {
        const sid = calcStreamId(url)
        await setLiveQuality({
          qualityLevel: value,
          app: 'rtp',
          streamId: sid,
        })
        await queryClient.invalidateQueries({
          queryKey: ['getQualityLevel', 'rtp', sid],
        })
      })

      useInterval(() => {
        if (
          // 没有 url 说明拉流接口一直在报错或没有返回
          !url ||
          // 视频 ts 超过 3 秒没有更新
          Date.now() - tsUpdateTime.current > 3000
        ) {
          refetch()
        }
      }, 3000)

      // 计算安全区相关
      const { safeY, topBar, bottomBar, videoWrapper } = useCalcSafeArea(size)

      const [aiData, setAIData] = useAIDataState()
      const aiDataRef = useLatest(aiData)

      const errMsg2 = useLatest(errMsg)

      useImperativeHandle(ref, () => ({
        snapshot,
        getAiData: () => aiDataRef.current ?? null,
      }))

      const finalUrl = useMemo(() => {
        if (url) {
          return url + `?t=-1&token=-1&tt=${fetchTime}`
        }
        return ''
      }, [url, fetchTime])

      const handleVideoElementChange = useUpdateProjectedVideo(
        deviceId,
        updateProjectedVideo,
      )

      return (
        <div
          className="size-full overflow-hidden relative text-sm"
          ref={wrapperRef}
          style={{ aspectRatio: aspectRatio }}
        >
          {/* 视频 SEI AI 检测 meta 信息 */}
          {Array.isArray(aiData?.displayMetaList) && (
            <SeiAIDataMetaInfo
              data={aiData.displayMetaList}
              videoWidth={size?.width}
            />
          )}
          <div
            className="absolute inset-0 m-auto max-w-full max-h-full"
            ref={videoWrapper}
            style={{
              aspectRatio: aspectRatio,
            }}
          >
            {/* 视频内容 */}
            <div
              ref={videoBoxRef}
              className={clsx('absolute inset-0 bg-black/60')}
              style={{
                aspectRatio: aspectRatio,
                transformOrigin: `${originCenter[0] * 100}% ${
                  originCenter[1] * 100
                }%`,
                transition: enableScale === 2 ? 'transform 0.3s' : undefined,
                transform:
                  enableScale === 2 && tranformCss
                    ? tranformCss
                    : 'translate(0px, 0px)',
              }}
            >
              {errMsg ? (
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="text-red-800 select-none">
                    <DisconnectOutlined className="mr-1" />
                    {errMsg}
                  </div>
                </div>
              ) : (
                <></>
              )}

              {finalUrl && !sn && renderVideo && (
                <Jessibuca
                  // key={jessibucaKey}
                  containerId={videoContainerId}
                  src={finalUrl}
                  onVideoInfo={(v) => {
                    const aspect = v.width / v.height
                    if (Math.abs(aspect - aspectRatio) > 1e-5) {
                      setAspectRatio(v.width / v.height)
                      onAspectRatioChange?.(v.width / v.height)
                    }
                  }}
                  onTimeUpdate={setTs}
                  onSeiAIData={setAIData}
                  onSeiProperties={onUavProperties}
                  onFetchError={handleRefresh}
                  onError={() => {
                    if (!errMsg2.current) {
                      setJessibucaKey((prev) => prev + 1)
                    }
                  }}
                  onStreamEnd={handleRefresh}
                  onTimeout={handleRefresh}
                  onVideoElementChange={(video) => {
                    handleVideoElementChange(video)
                    onVideoElementChange?.(video)
                  }}
                  refreshKey={jessibucaKey}
                />
              )}

              {sn && (
                <DaoTongPlayer
                  sn={sn}
                  containerId={videoContainerId}
                  onVideoInfo={({ videoRatio }) => {
                    if (Math.abs(videoRatio - aspectRatio) > 1e-5) {
                      setAspectRatio(videoRatio)
                      onAspectRatioChange?.(videoRatio)
                    }
                  }}
                />
              )}

              {/* 视频绘制框 */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {aiData && (
                  <SeiAIData data={aiData} onClickSeiBox={onClickSeiBox} />
                )}
                {enableScale === 1 && (
                  <DrawBox onDrawEnd={handleDrewScaleEnd} />
                )}
                {videoChildren}
                {videoSafeAreaChildren && (
                  <div
                    className="absolute inset-x-0"
                    style={{ top: `${safeY[0]}px`, bottom: `${safeY[1]}px` }}
                  >
                    {videoSafeAreaChildren}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ConfigProvider
            theme={{
              cssVar: {
                key: 'dushu',
              },
              hashed: false,
              components: {
                Select: {
                  paddingSM: 0,
                },
              },
            }}
          >
            {/* 上工具栏 */}
            {useTopBar && (leftTop || rightTop || useDing) && (
              <aside
                ref={topBar}
                className="absolute inset-x-0 bg-ground-1/80 p-1 px-2 h-8 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center h-full">
                  <section className="flex items-center gap-3">
                    {leftTop}
                  </section>
                  <section className="flex items-center gap-3">
                    {rightTop}
                    {useDing && (
                      <VideoDing
                        productKey={productKey}
                        deviceId={deviceId}
                        videoId={videoId}
                      />
                    )}
                  </section>
                </div>
              </aside>
            )}
            {/* 下工具栏 */}
            {useBottomBar && (
              <aside
                ref={bottomBar}
                className="absolute bottom-0 inset-x-0 bg-ground-1/80 p-1 px-2 h-8 z-30 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center h-full">
                  <section className="flex items-center gap-3">
                    <div className="text-fore text-xs">{formatTs(ts)}</div>
                    {Array.isArray(streamList) && streamList.length > 1 && (
                      <VideoStream
                        currentUrl={url}
                        streamList={streamList!}
                        deviceId={deviceId}
                        onChange={handleStreamChange}
                      />
                    )}
                    {+videoQuality >= 0 && (
                      <VideoQuality5G
                        value={videoQuality}
                        onChange={handle5GChange}
                      />
                    )}
                    {videoQuality == -1 &&
                      !isNil(useVideoQualityCheck?.valueDRC) && (
                        <VideoQualityDRC
                          value={useVideoQualityCheck.valueDRC ?? 'Unknown'}
                          onChange={useVideoQualityCheck?.onDRCChange}
                        />
                      )}
                    {leftBottom}
                  </section>
                  <section className="flex items-center gap-3">
                    <IconButton
                      tippyProps={{
                        content: t('common.refresh'),
                        appendTo: () =>
                          (document.fullscreenElement as HTMLElement) ??
                          document.body,
                      }}
                      className="order-20 text-[13px]"
                      onClick={async () => {
                        deviceStreamListCache.current = null
                        await handleRefresh()
                        setJessibucaKey((v) => v + 1)
                      }}
                    >
                      <IconRefresh />
                    </IconButton>
                    {location.hostname.includes('jing-an.com') ? (
                      <IconButton
                        tippyProps={{
                          content: (
                            <div>
                              <ShareQRCode
                                productKey={productKey}
                                deviceId={deviceId}
                                videoId={videoId}
                              />
                            </div>
                          ),
                          appendTo: () =>
                            (document.fullscreenElement as HTMLElement) ??
                            document.body,
                        }}
                        className="order-20 text-[13px]"
                        onClick={async () => {
                          await handleRefresh()
                          setJessibucaKey((v) => v + 1)
                        }}
                      >
                        <ShareAltOutlined />
                      </IconButton>
                    ) : (
                      <></>
                    )}

                    {globalConfig.enableElectricScale && (
                      <IconButton
                        className="scale-90"
                        tippyProps={{ content: t('video.electricScale.title') }}
                        active={!!enableScale}
                        onClick={() => {
                          setEnableScale(1 - Math.sign(enableScale))
                        }}
                      >
                        <ExpandOutlined />
                      </IconButton>
                    )}
                    <IconButton
                      tippyProps={{
                        content: !fullScreen
                          ? t('common.fullScreen')
                          : t('common.exit'),
                        appendTo: () =>
                          (document.fullscreenElement as HTMLElement) ??
                          document.body,
                      }}
                      className="order-20 text-[13px]"
                      onClick={toggleFullscreen}
                    >
                      {!fullScreen ? <IconFull /> : <FullscreenExitOutlined />}
                    </IconButton>
                    {rightBottom}
                  </section>
                </div>
              </aside>
            )}
          </ConfigProvider>
          {wrapperChildren}
        </div>
      )
    },
  ),
)

DeviceLiveVideo.displayName = 'DeviceLiveVideo'

export default DeviceLiveVideo
