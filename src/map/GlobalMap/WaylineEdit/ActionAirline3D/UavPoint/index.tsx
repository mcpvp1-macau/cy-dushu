import { useInitAndBigFly } from './useInitAndBigFly'
import { useUavEntity } from './useUavEntity'
import { useUpdateUav } from './useUpdateUav'
import EoFrustum from './EoFrustum'

type PropsType = unknown

const UavPoint: FC<PropsType> = () => {
  // 更新无人机
  useUpdateUav()

  // 初始化无人机和摄像头飞行
  useInitAndBigFly()

  useUavEntity()

  return <EoFrustum />
}

export default UavPoint
