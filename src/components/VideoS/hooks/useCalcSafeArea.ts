import { useThrottleEffect } from 'ahooks'

const useCalcSafeArea = (key: any) => {
  const topBar = useRef<HTMLDivElement>(null)
  const bottomBar = useRef<HTMLDivElement>(null)
  const videoWrapper = useRef<HTMLDivElement>(null)
  const [safeY, setSafeY] = useState([0, 0])
  useThrottleEffect(
    () => {
      if (!videoWrapper.current) {
        return
      }
      let top = 0
      let bottom = 0
      const videoWrapperRect = videoWrapper.current.getBoundingClientRect()
      if (topBar.current) {
        const { y, height } = topBar.current.getBoundingClientRect()
        top = Math.max(y - videoWrapperRect.y + height, 0)
      }
      if (bottomBar.current) {
        const { y } = bottomBar.current.getBoundingClientRect()
        bottom = Math.max(videoWrapperRect.y + videoWrapperRect.height - y, 0)
      }
      setSafeY([top, bottom])
    },
    [key],
    { wait: 200, leading: true },
  )
  return { safeY, topBar, bottomBar, videoWrapper }
}

export default useCalcSafeArea
