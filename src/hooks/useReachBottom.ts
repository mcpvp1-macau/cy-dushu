const useReachBottom = (callBack: Function, delta = 5) => {
  const isReachBottom = useRef(false)
  const handleScroll = useMemoizedFn((e: React.UIEvent) => {
    if (
      e.currentTarget.scrollHeight -
        (e.currentTarget.scrollTop + e.currentTarget.clientHeight) <
      delta
    ) {
      if (!isReachBottom.current) {
        callBack()
        isReachBottom.current = true
      }
    } else {
      isReachBottom.current = false
    }
  })
  return handleScroll
}

export default useReachBottom
