import { memo, type FC } from 'react'
import ARSenceBanFlyArea from './BanFlyArea'

type PropsType = unknown

/** 禁飞区 */
const ARSceneBanAreas: FC<PropsType> = memo(() => {
  return (
    <ARSenceBanFlyArea
      data={[
        [119.949257, 30.27631, 300],
        [119.949461, 30.273442, 300],
        [119.954084, 30.273731, 300],
        [119.953555, 30.275827, 300],
        [119.951844, 30.275422, 300],
        [119.951844, 30.275422, 300],
        [119.949257, 30.27631, 300],
      ]}
    />
  )
})

ARSceneBanAreas.displayName = 'ARSceneBanAreas'

export default ARSceneBanAreas
