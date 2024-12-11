import { memo, type FC } from 'react'
import DrawTakeoffRef from './components/DrawTakeoffRef'

type PropsType = unknown

const AreaWayline: FC<PropsType> = memo(() => {
  return (
    <>
      <DrawTakeoffRef />
    </>
  )
})

AreaWayline.displayName = 'AreaWayline'

export default AreaWayline
