import Jessibuca from '@/components/Video/Jessibuca'
import {
  liveShare,
  getDeviceStreamListShare,
} from '@/service/modules/device/device-video-share'
import { Responses } from '@/service/servers/liqunAxios'
import { verifyToken } from '@/utils/ak'
import { shouldJson } from '@/utils/json'
// import { calcStreamId } from '@/utils/video/stream'
import {
  //   useFullscreen,
  useInterval,
  useLatest,
  //   useSize,
  useThrottleFn,
} from 'ahooks'
// import VConsole from 'vconsole'
import XGFlvVideo from './XGFlvVideo'
import { formatTs } from '@/utils/format/time'

// const vConsole = new VConsole()

const ShareVideo: React.FC = () => {
  const params = useParams()
  const { productKey, deviceId, videoId, token } = params

  const queryClient = useQueryClient()

  const [errMsg, setErrMsg] = useState('')

  // 解析 token 获取预签名参数
  const tokenData = useMemo(() => {
    if (!token) return null
    try {
      const paramsStr = verifyToken(token)
      const params = shouldJson(paramsStr)
      if (!params) return null
      return params
    } catch (error) {
      console.error('Token 解析失败:', error)
      return null
    }
  }, [token])

  const LastUrlRef = useRef('')
  // 获取设备视频流列表
  const deviceStreamListCache = useRef<
    Awaited<ReturnType<typeof getDeviceStreamListShare>>['data'] | null
  >(null)

  const fetchDeviceStreamListShare = async () => {
    if (deviceStreamListCache.current) {
      return deviceStreamListCache.current
    }
    if (!tokenData?.streamListSign) {
      return null
    }
    try {
      const res = await getDeviceStreamListShare({
        streamId: `${productKey}/${deviceId}`,
        AccessKeyId: tokenData.streamListSign.AccessKeyId,
        Signature: tokenData.streamListSign.Signature,
      })
      deviceStreamListCache.current = res.data
    } catch (_error) {}
    return deviceStreamListCache.current
  }

  // 重新拉流的时间戳
  const [fetchTime, setFetchTime] = useState(0)

  const { data, refetch } = useQuery(
    {
      queryKey: ['getVideoUrl', { productKey, deviceId, videoId }],
      enabled: !!deviceId && !!productKey && !!tokenData,
      queryFn: async () => {
        if (!productKey || !deviceId || !videoId || !tokenData) {
          return { url: '', streamList: [] }
        }
        try {
          // 同时获取视频直播地址和流列表
          const [liveData, streamList] = await Promise.all([
            liveShare(productKey, deviceId, {
              videoId,
              AccessKeyId: tokenData.liveSign.AccessKeyId,
              Signature: tokenData.liveSign.Signature,
            }),
            fetchDeviceStreamListShare(), // 为了保证第一次拉流时, 能记住上一次选择的视频流, 所以一起请求
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
              setErrMsg('该设备已离线')
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
  //   const streamList = data?.streamList

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
  //   const [fullScreen, { toggleFullscreen }] = useFullscreen(wrapperRef)

  const videoBoxRef = useRef<HTMLDivElement>(null)
  //   const size = useSize(videoBoxRef)

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

  //   const streamId = useMemo(() => playUrl && calcStreamId(playUrl), [playUrl])

  const [url, setUrl] = useState(playUrl ?? '')

  useEffect(() => {
    setUrl(playUrl ?? '')
  }, [playUrl])

  const errMsg2 = useLatest(errMsg)

  const finalUrl = useMemo(() => {
    if (url) {
      return url + `?t=-1&token=-1&tt=${fetchTime}`
    }
    return ''
  }, [url, fetchTime])

  const [isExpire, setIsExpire] = useState('')

  const getExpireTime = () => {
    if (!tokenData) {
      setIsExpire('分享异常')
      return
    }
    if (tokenData.productKey !== productKey) {
      setIsExpire('分享异常')
      return
    }
    if (tokenData.deviceId !== deviceId) {
      setIsExpire('分享异常')
      return
    }
    if (tokenData.videoId !== videoId) {
      setIsExpire('分享异常')
      return
    }
    const diff = Date.now() - tokenData.time
    if (diff > 24 * 60 * 60 * 1000) {
      // token 过期
      setIsExpire('分享已过期')
    }
  }

  useInterval(
    () => {
      getExpireTime()
    },
    isExpire ? undefined : 60 * 1000,
  )

  useEffect(() => {
    getExpireTime()
  }, [token])

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent)
  }

  function isAndroid() {
    return navigator.userAgent.match(/Android/i)
  }

  const isWeChatAndroid = useMemo(
    () => isWeChatBrowser() && isAndroid(),
    [isWeChatBrowser, isAndroid],
  )

  if (isExpire) {
    return (
      <div className="bg-ground-1 text-fore w-full h-[100vh] flex items-center justify-center">
        <div>{isExpire}</div>
      </div>
    )
  }

  return (
    <div className="bg-ground-1 text-fore w-full h-[100vh]">
      {finalUrl ? (
        <div className="absolute top-0 left-0 w-full z-10 h-10 bg-black/50 flex items-center justify-center">
          <div className="text-white text-xs">{formatTs(ts)}</div>
        </div>
      ) : (
        <></>
      )}
      <div
        className="size-full overflow-hidden relative bg-black text-sm"
        ref={wrapperRef}
        style={{ aspectRatio: aspectRatio }}
      >
        <div
          className="absolute inset-0 m-auto max-w-full max-h-full"
          style={{
            aspectRatio: aspectRatio,
          }}
        >
          {/* 视频内容 */}
          <div
            ref={videoBoxRef}
            className={clsx('absolute inset-0 bg-black')}
            style={{
              aspectRatio: aspectRatio,
            }}
          >
            {errMsg ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="text-red-800 text-xs">{errMsg}</div>
              </div>
            ) : (
              <></>
            )}

            {finalUrl && isWeChatAndroid ? (
              <XGFlvVideo
                src={finalUrl.replace('ws', 'http')}
                onVideoInfo={(v) => {
                  const aspect = v.width / v.height
                  if (Math.abs(aspect - aspectRatio) > 1e-5) {
                    setAspectRatio(v.width / v.height)
                  }
                }}
                onTimeUpdate={(ts) => {
                  setTs(ts.position * 1000)
                  console.log('ts', ts, Date.now())
                }}
                autostart
                onError={() => {
                  handleRefresh()
                }}
              />
            ) : (
              <></>
            )}

            {finalUrl && !isWeChatAndroid && (
              <Jessibuca
                // key={jessibucaKey}
                containerId={'1'}
                src={finalUrl}
                onVideoInfo={(v) => {
                  const aspect = v.width / v.height
                  if (Math.abs(aspect - aspectRatio) > 1e-5) {
                    setAspectRatio(v.width / v.height)
                  }
                }}
                onTimeUpdate={setTs}
                onFetchError={handleRefresh}
                onError={() => {
                  if (!errMsg2.current) {
                    setJessibucaKey((prev) => prev + 1)
                  }
                }}
                onStreamEnd={handleRefresh}
                onTimeout={handleRefresh}
                refreshKey={jessibucaKey}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareVideo
