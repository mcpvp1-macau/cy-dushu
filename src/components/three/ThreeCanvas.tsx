import { Canvas } from '@react-three/fiber'
import { GetProps } from 'antd'
import { createContext, type RefObject } from 'react'

type PropsType = GetProps<typeof Canvas>

const ThreeCanvas: FC<PropsType> = memo((props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative size-full" ref={wrapperRef}>
      <WrapperContext.Provider value={wrapperRef}>
        <Canvas {...props}></Canvas>
      </WrapperContext.Provider>
    </div>
  )
})

ThreeCanvas.displayName = 'ThreeCanvas'

export default ThreeCanvas

const WrapperContext = createContext<RefObject<HTMLDivElement> | undefined>(
  undefined,
)

export const useThreeCanvasWrapper = () => useContext(WrapperContext)
