import IconGamepad from '@/assets/icons/jsx/uav/IconGamepad'
import { Button } from 'antd'
import { memo, type FC } from 'react'

type PropsType = unknown

/** 摇杆 */
const Gamepad: FC<PropsType> = memo(() => {
  return (
    <Button className="grow h-[26px] px-0" icon={<IconGamepad />}>
      摇杆
    </Button>
  )
})

Gamepad.displayName = 'Gamepad'

export default Gamepad
