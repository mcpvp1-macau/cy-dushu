type PropsType = {
  src: string
  alt?: string
  children?: ReactNode
}

// 为了更好的性能, 不添加 useSize 作为监控容器大小, 最好外部固定大小, 若要响应式, 可以另外实现

/** 给 object-fit: contain 的图片添加绘制容器 */
const ImageContainBox: FC<PropsType> = memo(({ src, alt, children }) => {
  const imgRef = useRef<HTMLImageElement>(null)

  const [drawRectXY, setDrawRectXY] = useState([0, 0])
  const [drawRectWH, setDrawRectWH] = useState([0, 0])

  const handleOnLoad = useMemoizedFn(() => {
    if (!imgRef.current) {
      return
    }
    const nw = imgRef.current.naturalWidth,
      nh = imgRef.current.naturalHeight
    const cw = imgRef.current.width,
      ch = imgRef.current.height
    const wr = nw / cw
    const hr = nh / ch
    const radio = nw / nh

    if (wr > hr) {
      const w = cw,
        h = cw / radio
      setDrawRectWH([w, h])
      setDrawRectXY([0, (ch - h) / 2])
    } else {
      const w = ch * radio,
        h = ch
      setDrawRectWH([w, h])
      setDrawRectXY([(cw - w) / 2, 0])
    }
  })

  return (
    <div className="relative size-full">
      <img
        ref={imgRef}
        className="size-full object-contain"
        src={src}
        alt={alt}
        onLoad={handleOnLoad}
      />
      {/* 绘制容器, 绘制元素往里面塞即可 */}
      <div
        className="absolute"
        style={{
          width: drawRectWH[0],
          height: drawRectWH[1],
          left: drawRectXY[0],
          top: drawRectXY[1],
        }}
      >
        {children}
      </div>
    </div>
  )
})

ImageContainBox.displayName = 'ImageContainDrawRect'

export default ImageContainBox
