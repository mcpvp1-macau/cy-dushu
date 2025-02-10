import IconVisible from '@/assets/icons/jsx/IconVisible'
import CustomExpandIcon from '@/components/CustomExpandIcon'
import useSelectedGroup from '../hooks/useSelectedGroup'
import IconButton from '@/components/ui/button/IconButton'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'

type PropsType = {
  data: API_DEVICE.domain.DeviceTreeItem
  depth?: number
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
const GroupHeader: FC<PropsType> = memo(({ data, depth }) => {
  const [total, onlineCnt] = useMemo(() => calcDeviceTotal(data), [data])
  const selectedKeys = useSelectedGroup()

  const isHidden = useDeviceListConfigStore(
    (s) => s.hiddenGroupIds[data.groupId],
  )
  const updateHiddenDeviceIds = useDeviceListConfigStore(
    (s) => s.updateHiddenDeviceIds,
  )

  const handleVisibleChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    const will = !isHidden
    const newDeviceIds = {
      ...useDeviceListConfigStore.getState().hiddenDeviceIds,
    }
    const dfs = (data: API_DEVICE.domain.DeviceTreeItem) => {
      data.devices?.forEach?.((d) => (newDeviceIds[d.deviceId] = will))
      data.children?.forEach?.(dfs)
    }
    dfs(data)
    updateHiddenDeviceIds(newDeviceIds)
  }

  return (
    <div className="p-1 px-3 w-[350px] flex items-center justify-between">
      <div style={{ marginLeft: `${depth ?? 0}em` }}>
        {data.groupName} ({onlineCnt}/{total})
      </div>
      <div className="flex gap-3">
        <IconButton onClick={handleVisibleChange}>
          {isHidden ? <IconNotVisible /> : <IconVisible />}
        </IconButton>
        <CustomExpandIcon isActive={selectedKeys.includes(data.groupId)} />
      </div>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

export default GroupHeader
