/** 监听 DOM 元素 Rect */
const useDomRect = (ref: React.RefObject<HTMLElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // Initial measurement
    setRect(ref.current.getBoundingClientRect())

    // Set up resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newRect = entry.target.getBoundingClientRect()
        setRect(newRect)
      }
    })

    // Start observing
    resizeObserver.observe(ref.current)

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
