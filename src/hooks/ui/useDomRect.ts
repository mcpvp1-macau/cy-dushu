/** 监听 DOM 元素 Rect */
const useDomRect = (ref: React.RefObject<HTMLElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null)

  const fn = useMemoizedFn(() => {
    if (ref.current) {
      // 获取元素的计算样式
      const style = window.getComputedStyle(ref.current)
      const transform = style.transform || style.webkitTransform // 兼容性处理

      // 解析 transform 矩阵
      let translateX = 0
      let translateY = 0
      if (transform && transform !== 'none') {
        const matrix = transform
          .match(/matrix\((.+)\)/)?.[1]
          .split(',')
          .map(Number)
        if (matrix && matrix.length >= 6) {
          // matrix(1, 0, 0, 1, tx, ty) -> tx 是 translateX, ty 是 translateY
          translateX = matrix[4]
          translateY = matrix[5]
        }
      }

      const newRect = ref.current?.getBoundingClientRect()
      newRect.x += translateX
      newRect.y += translateY
      setRect(newRect)
    }
  })

  useEffect(() => {
    if (!ref.current) return

    // Initial measurement
    setRect(ref.current.getBoundingClientRect())

    // Set up resize observer
    const resizeObserver = new MutationObserver(fn)

    // Start observing
    resizeObserver.observe(ref.current, { attributes: true })

    // Clean up observer on unmount
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return
      setRect(ref.current.getBoundingClientRect())
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [ref])

  return rect
}

export default useDomRect
