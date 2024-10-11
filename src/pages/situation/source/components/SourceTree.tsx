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

  const resolveGroup = useMemoizedFn(
    (data: API_DEVICE.domain.DeviceTreeItem) => {
      const { children, devices } = data

      return {
        key: data.groupId,
        title: <GroupHeader data={data} />,
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
          ...(children?.map(resolveGroup) ?? []).filter(
            (e: any) => e.children.length > 0,
          ),
        ],
      }
    },
  )

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
