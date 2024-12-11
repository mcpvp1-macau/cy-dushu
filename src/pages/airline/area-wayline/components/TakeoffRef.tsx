import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import { Button } from 'antd'
import { memo, type FC } from 'react'

type PropsType = unknown

const TakeoffRef: FC<PropsType> = memo(() => {
  const takeOffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const updateIsDrawHome = useAreaWaylineStore((s) => s.updateIsDrawHome)

  return (
    <XCard
      title={takeOffRefPoint ? '已设置参考起飞点' : '未设置起飞点'}
      topRight={
        <Button
          type="link"
          icon={<IconTakeoff />}
          size="small"
          onClick={() => updateIsDrawHome(true)}
        >
          {takeOffRefPoint ? '重设' : '设置'}起飞点
        </Button>
      }
    />
  )
})

TakeoffRef.displayName = 'TakeoffRef'

export default TakeoffRef
