import styles from './sourcetree.module.less'
import { Spin, Tree } from 'antd'
import GroupHeader from './GroupHeader'
import { EventDataNode } from 'antd/es/tree'
import DeviceItem from './DeviceItem'
import { Provider } from '../hooks/useSelectedGroup'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { deviceStatusFilter } from '../utils'
import { useShallow } from 'zustand/react/shallow'
import { ScrollArea } from '@/components/ui/scroll-area'

type PropsType = {
  isLoading?: boolean
  data: API_DEVICE.domain.DeviceTreeItem
}

const SourceTree: FC<PropsType> = memo(({ isLoading, data }) => {
  const { isOnline, isTask, isNotTask } = useDeviceListConfigStore(
    useShallow((s) => ({
      isOnline: s.isOnline,
      isTask: s.isTask,
      isNotTask: s.isNotTask,
    })),
  )

  const resolveGroup = (data: API_DEVICE.domain.DeviceTreeItem, depth = 0) => {
    const { children, devices } = data
    return {
      key: data.groupId,
      title: <GroupHeader data={data} depth={depth} />,
      children: [
        ...devices
          .filter((e) => deviceStatusFilter(e, isOnline, isTask, isNotTask))
          .map((e) => {
            return {
              key: `device-${e.deviceId}`,
              title: <DeviceItem data={e} />,
              isLeaf: true,
            }
          }),
        ...(children?.map((e) => resolveGroup(e, depth + 1)) ?? []).filter(
          (e: any) => e.children.length > 0,
        ),
      ],
    }
  }

  const treeData = useMemo(
    () => [resolveGroup(data)],
    [data, isOnline, isTask, isNotTask],
  )
  const [expandKeys, setExpandKeys] = useState<React.Key[]>([
    data.groupId ?? '',
  ])

  const handleSelect = (
    _: React.Key[],
    info: {
      event: 'select'
      selected: boolean
      node: EventDataNode<any>
      selectedNodes: any[]
      nativeEvent: MouseEvent
    },
  ) => {
    const { node } = info
    // 设备
    if (node.isLeaf) {
      return
    }
    const { key } = node
    // 组织
    if (expandKeys.includes(key)) {
      setExpandKeys(expandKeys.filter((k) => k !== key))
    } else {
      setExpandKeys([...expandKeys, key])
    }
  }

  const hiddenDeviceIds = useDeviceListConfigStore((s) => s.hiddenDeviceIds)
  const updateHiddenGroupIds = useDeviceListConfigStore(
    (s) => s.updateHiddenGroupIds,
  )
  useEffect(() => {
    const newHiddenGroupIds = { ...hiddenDeviceIds }
    const dfs = (data: API_DEVICE.domain.DeviceTreeItem) => {
      if (!data?.groupId) {
        return true
      }
      newHiddenGroupIds[data.groupId] =
        // every 自带短路, 需要先 map, 确保所有 group 都能遍历到, 并且需要放在筛设备前
        (data.children?.map?.(dfs)?.every((e) => e) ?? true) &&
        (data.devices?.every?.((d) => hiddenDeviceIds[d.deviceId]) ?? true)
      return newHiddenGroupIds[data.groupId]
    }
    dfs(data)
    updateHiddenGroupIds(newHiddenGroupIds)
  }, [data, hiddenDeviceIds])

  return (
    <ScrollArea className="h-full">
      <div className={styles.sourceTree}>
        <Spin spinning={isLoading}>
          <Provider value={expandKeys}>
            <Tree
              treeData={treeData}
              defaultExpandAll
              expandedKeys={expandKeys}
              onSelect={handleSelect}
            />
          </Provider>
        </Spin>
      </div>
    </ScrollArea>
  )
})

SourceTree.displayName = 'SourceTree'

export default SourceTree
