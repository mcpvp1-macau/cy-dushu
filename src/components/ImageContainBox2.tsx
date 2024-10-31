type PropsType = {
  src: string
  alt?: string
  children?: ReactNode
}

/** 由外界控制大小 */
const ImageContainBox2: FC<PropsType> = memo(({ src, alt, children }) => {
  const imgRef = useRef<HTMLImageElement>(null)

  const [aspectRatio, setAspectRadio] = useState(16 / 9)

  const handleOnLoad = useMemoizedFn(() => {
    if (!imgRef.current) {
      return
    }
    const nw = imgRef.current.naturalWidth,
      nh = imgRef.current.naturalHeight
    setAspectRadio(nw / nh)
  })

  return (
    <div className="relative size-full bg-black">
      {/* 绘制容器, 绘制元素往里面塞即可 */}
      <div
        className="absolute inset-0 m-auto max-w-full max-h-full"
        style={{ aspectRatio }}
      >
        <img
          ref={imgRef}
          className="size-full object-contain"
          src={src}
          alt={alt}
          onLoad={handleOnLoad}
        />
        {children}
      </div>
    </div>
  )
})

ImageContainBox2.displayName = 'ImageContainDrawRect'

export default ImageContainBox2
