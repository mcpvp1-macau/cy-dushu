import PositionTooltip from '@/components/three/PositionTooltip'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Line } from '@react-three/drei'
import { TextureLoader, Vector2, Vector3 } from 'three'

type PropsType = unknown

const PointActionDisplayInner: FC<{ target: Vector3 }> = memo((props) => {
  const x = useRebotDogControlRoomStore((s) => s.state.x || 0)
  const y = useRebotDogControlRoomStore((s) => s.state.y || 0)
  const z = useRebotDogControlRoomStore((s) => s.state.z || 0)
  const speed = useRebotDogControlRoomStore((s) => s.state.speed || 0.5)

  const distance = useMemo(() => {
    if (!props.target) return 0
    return Math.sqrt(
      (props.target.x - x) ** 2 +
        (props.target.y - y) ** 2 +
        (props.target.z - z) ** 2,
    )
  }, [props.target, x, y, z])

  const predicateTime = distance / speed

  return (
    <>
      <sprite
        scale={0.033}
        center={new Vector2(0.5, 0)}
        position={props.target}
      >
        <spriteMaterial
          sizeAttenuation={false}
          map={new TextureLoader().load('/images/marker/icon/targetPoint.svg')}
          depthTest={false}
        ></spriteMaterial>
      </sprite>
      <Line
        points={[new Vector3(x, y, z), props.target]}
        color="#3d87e9"
        linewidth={2}
      />
      <PositionTooltip position={props.target} offset={[0, 30]}>
        <div className="p-2 flex flex-col gap-1 text-fore bg-[#27303b] min-w-[150px] rounded-md shadow-lg">
          <p className="flex justify-between">
            {'任务距离'}:{' '}
            <span>
              {distance > 1_000
                ? `${(distance / 1_000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between">
            {'预估时间'}: <span>{predicateTime.toFixed(1)} s</span>
          </p>
          <p>
            <InfoCircleOutlined className="text-orange-400" /> {'路线仅供参考'}
          </p>
        </div>
      </PositionTooltip>
    </>
  )
})

/** 指点前进回显 */
const PointActionDisplay: FC<PropsType> = memo(() => {
  const displayMode = useRebotDogControlRoomStore((s) => s.state.displayMode)

  const position = useMemo(() => {
    if (!displayMode?.startsWith('正在前往目标点')) {
      return null
    }
    const positionStr = displayMode.split(':')[1]
    if (!positionStr) {
      return null
    }
    const position = positionStr.split(',')
    const x = Number(position[0] ?? '0')
    const y = Number(position[1] ?? '0')
    const z = Number(position[2] ?? '0.14')
    return new Vector3(x, y, z)
  }, [displayMode])

  if (!position) {
    return null
  }

  return <PointActionDisplayInner target={position} />
})

PointActionDisplay.displayName = 'PointActionDisplay'

export default PointActionDisplay
