import React from 'react'

type PropsType = {
  sn: string
  containerId?: string
}

const DaoTongPlayer: React.FC<PropsType> = (props) => {
  const { sn, containerId } = props
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (window.AutelMedia) {
      const instance = new window.AutelMedia.Player()
      // 设置连接前缀
      instance.setProxyPrefix(
        `${globalConfig.globalWs}://${location.host}/_ws_proxy/`,
      )
      // 开始播放
      instance
        .play({
          // 设备SN
          id: sn,
          // 视频元素
          videoElement: ref.current!,
          // 拉流协议
          protocol: 'rtc-rtc',
          // 服务器地址
          server: '/_proxy/' + globalConfig.daotongServer,
        })
        .then((res: number) => {
          console.log('播放结果：', res === 0 ? '成功' : '失败')
        })

      return () => {
        instance.stop()
      }
    }
  }, [sn])
  return (
    <video autoPlay muted id={containerId} ref={ref}>
      Your browser is too old which doesn't support HTML5 video.
    </video>
  )
}

export default React.memo(DaoTongPlayer)
