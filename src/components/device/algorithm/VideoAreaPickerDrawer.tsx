import { useControllableValue, useSize } from 'ahooks'
import { Button } from 'antd'
import XModal from '@/components/XModal'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'

type Props = {
  value: any[][]
  onChange: (value: any[][]) => void
  visible: boolean
  setVisible: (visible: boolean) => void
  videoInfo?: {
    productKey: string
    deviceId: string
    videoId: string
  }
}
const VideoAreaPickerDrawer: React.FC<Props> = (props) => {
  const { visible, setVisible } = props

  const [state, setState] = useControllableValue<any[]>(props)
  const ref = useRef<any>()

  const size = useSize(ref)
  const { width = 1, height = 1 } = size || {}

  const [isDraw, setIsDraw] = useState(false)
  const [positions1, setPositions] = useState<{ x: number; y: number }[]>([])
  const drawingRef = useRef(false)

  const onClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isDraw) {
      drawingRef.current = true
      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY
      const width = ref.current?.offsetWidth
      const height = ref.current?.offsetHeight

      setPositions((v) => [...v, { x: x / width, y: y / height }])
    }
  }

  const onMouseMove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // if (width === 1) {
    //   setCnt((v) => v + 1);
    // }
    if (drawingRef.current) {
      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY
      const width = ref.current?.offsetWidth
      const height = ref.current?.offsetHeight

      setPositions((v) => {
        if (v.length > 1) {
          const arr = v.map((item, i) => {
            if (i === v.length - 1) {
              return { x: x / width, y: y / height }
            }
            return item
          })
          return arr
        } else if (v.length === 1) {
          return [...v, { x: x / width, y: y / height }]
        }
        return v
      })
    } else {
    }
  }

  const onContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    positions1.length && setState((v) => [...v, positions1])
    setIsDraw(false)
    drawingRef.current = false
    setPositions([])
  }

  const [checked, setChecked] = useState(-1)

  const onChecked = (v: number) => {
    setChecked(v)
  }

  const start = () => {
    setPositions([])
    setIsDraw(true)
  }

  const del = () => {
    setState((v) => v.filter((item, i) => i !== checked))
    setChecked(-1)
  }

  return (
    <XModal
      width={700}
      title="视频框选"
      open={visible}
      onClose={() => setVisible(false)}
      onConfirm={() => setVisible(false)}
    >
      {visible ? (
        <>
          <div className="mb-3 flex gap-3">
            <Button onClick={start}>开始框选</Button>
            <Button onClick={del}>删除选中</Button>
          </div>
          <div className="relative w-full aspect-video mb-3 bg-black" ref={ref}>
            {props.videoInfo && (
              <DeviceLiveVideo
                deviceId={props.videoInfo.deviceId}
                productKey={props.videoInfo.productKey}
                videoId={props.videoInfo.videoId}
                useTopBar={false}
                useBottomBar={false}
                videoChildren={
                  <div
                    onClick={onClick}
                    onMouseMove={onMouseMove}
                    onContextMenu={onContextMenu}
                    className="absolute z-[999] top-0 left-0 w-full h-full border-[red] border-solid border-[1px] pointer-events-auto"
                  >
                    <svg className="absolute z-[999] top-0 left-0  w-full h-full">
                      {[...state, positions1].map((positions, i) => {
                        return (
                          <g key={i} onClick={() => onChecked(i)}>
                            <path
                              d={(positions.length
                                ? [...positions, positions[0]]
                                : []
                              )
                                .map(
                                  (item, i) =>
                                    `${i ? 'L' : 'M'}${item.x * width},${
                                      item.y * height
                                    }`,
                                )
                                .join(' ')}
                              stroke={'red'}
                              fill="rgba(0,0,0,0)"
                              strokeDasharray={i === checked ? '5,3' : '0,0'}
                            ></path>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                }
              />
            )}
          </div>
        </>
      ) : null}
    </XModal>
  )
}

export default VideoAreaPickerDrawer
