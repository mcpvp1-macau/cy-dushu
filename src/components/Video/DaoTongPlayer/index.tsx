import React from 'react'

type PropsType = {
  sn: string
  containerId?: string
  onVideoInfo?: (videoInfo: {
    bitrate: string
    lostrate: string
    videoRatio: number
  }) => void
}

const DaoTongPlayer: React.FC<PropsType> = (props) => {
  const { sn, containerId, onVideoInfo } = props
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (window.AutelMedia) {
      // const instance = new window.AutelMedia.Player()
      // // 设置连接前缀
      // instance.setProxyPrefix(
      //   `${globalConfig.globalWs}://${location.host}/_ws_proxy/`,
      // )
      // // 开始播放
      // instance
      //   .play({
      //     // 设备SN
      //     id: sn,
      //     // 视频元素
      //     videoElement: ref.current!,
      //     // 拉流协议
      //     protocol: 'rtc-rtc',
      //     // 服务器地址
      //     server: '/_proxy/' + globalConfig.daotongServer,
      //   })
      //   .then((res: number) => {
      //     console.log('播放结果：', res === 0 ? '成功' : '失败')
      //   })

      const player = new window.AutelMedia(ref.current!, {
        // 流id
        streamId: `${sn}/live`,
        // 服务器地址
        serverUrl: '/_proxy/' + globalConfig.daotongServer,
        proxyPrefix: '/_proxy',
        // 播放失败的回调  errorcode 错误码  error 错误信息
        onerror: (errorcode, error: any) => {},
        // 播放开始的回调
        onstart: () => {},
        // 播放成功的回调
        onsuccess: () => {},
        // 播放信息回调 比特率/码率 bitrate  丢包数 lostrate
        oninfo: (videoInfo: {
          bitrate: string
          lostrate: string
          videoRatio: number
        }) => {
          onVideoInfo?.({ ...videoInfo })
        },
        // 播放状态回调 status 链接状态 AConnectStatus    reason 原因
        onstatus: (status, reason: string) => {},
      })

      // 开始播放
      player.startPlay()
      return () => {
        // instance.stop()
        player?.stopPlay()
      }
    }
  }, [sn])
  return (
    <video
      autoPlay
      muted
      id={containerId}
      ref={ref}
      className="size-full overflow-hidden relative"
    >
      Your browser is too old which doesn't support HTML5 video.
    </video>
  )
}

export default React.memo(DaoTongPlayer)
