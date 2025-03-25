import GradientFrustum from '@/components/map/BasePrimitive/GradientFrustum'

type PropsType = unknown

const Demo: FC<PropsType> = memo(() => {
  return (
    <>
      <GradientFrustum
        longitude={120}
        latitude={30}
        height={1000}
        fov={30}
        aspect={1}
        yaw={30}
        pitch={30}
        roll={0}
        color1="#ff000030"
        color2="#0000ff30"
      />
    </>
  )
})

Demo.displayName = 'Demo'

export default Demo
