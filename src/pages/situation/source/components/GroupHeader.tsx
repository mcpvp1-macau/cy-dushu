import IconVisible from '@/assets/icons/jsx/IconVisible'
import CustomExpandIcon from '@/components/CustomExpandIcon'
import { memo, type FC } from 'react'
import useSelectedGroup from '../hooks/useSelectedGroup'

type PropsType = {
  data: API_DEVICE.domain.DeviceTreeItem
}

// 统计设备总数和在线数
const calcDeviceTotal = (
  data: API_DEVICE.domain.DeviceTreeItem,
): [number, number] => {
  const { children, devices } = data
  let total = devices?.length ?? 0
  let online =
    devices?.reduce(
      (acc, item) => acc + (item.status === 'ONLINE' ? 1 : 0),
      0,
    ) ?? 0

  if (children) {
    children.forEach((item) => {
      const [subTotal, subOnline] = calcDeviceTotal(item)
      total += subTotal
      online += subOnline
    })
  }

  return [total, online]
}

/** 树头 */
const GroupHeader: FC<PropsType> = memo(({ data }) => {
  const [total, onlineCnt] = useMemo(() => calcDeviceTotal(data), [data])
  const selectedKeys = useSelectedGroup()

  return (
    <div className="p-1 px-3 w-[350px] flex items-center justify-between">
      <div>
        {data.groupName} ({onlineCnt}/{total})
      </div>
      <div className="flex gap-3">
        <IconVisible />
        <CustomExpandIcon isActive={selectedKeys.includes(data.groupId)} />
      </div>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

export default GroupHeader
