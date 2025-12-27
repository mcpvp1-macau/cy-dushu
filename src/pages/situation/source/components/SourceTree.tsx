import { Spin } from 'antd'
import GroupHeader from './GroupHeader'
import { EventDataNode } from 'antd/es/tree'
import DeviceItem from './DeviceItem'
import { Provider } from '../hooks/useSelectedGroup'
import useDeviceFilterConfigStore from '@/store/useDeviceFilterConfig.store'
import { deviceStatusFilter } from '../utils'
import { useShallow } from 'zustand/react/shallow'
import XTree from '@/components/ui/XTree'
import { useSize } from 'ahooks'

type PropsType = {
  isLoading?: boolean
  data: API_DEVICE.domain.DeviceTreeItem
  onDeviceItemClick?: (data: API_DEVICE.domain.Device) => void
  deviceItemPrefix?: (data: API_DEVICE.domain.Device) => ReactNode
  deviceItemSuffix?: (data: API_DEVICE.domain.Device) => ReactNode
  deviceItemBottom?: (data: API_DEVICE.domain.Device) => ReactNode
  compareFn?: (
    a: API_DEVICE.domain.Device,
    b: API_DEVICE.domain.Device,
  ) => number
}

/** 设备树，该组件为虚拟列表，请确保父容器的高度 */
const SourceTree: FC<PropsType> = memo(
  ({
    isLoading,
    data,
    compareFn,
    onDeviceItemClick,
    deviceItemPrefix,
    deviceItemSuffix,
    deviceItemBottom,
  }) => {
    const { isOnline, isTask, isNotTask } = useDeviceFilterConfigStore(
      useShallow((s) => ({
        isOnline: s.isOnline,
        isTask: s.isTask,
        isNotTask: s.isNotTask,
      })),
    )

    const resolveGroup = (
      data: API_DEVICE.domain.DeviceTreeItem,
      depth = 0,
    ) => {
      const { children, devices } = data

      console.log('data devices', devices)
      const childrenDevice = (devices || [])?.filter((e) =>
        deviceStatusFilter(e, isOnline, isTask, isNotTask),
      )

      if (compareFn) {
        childrenDevice.sort((a, b) => compareFn(a, b))
      }

      return {
        key: data.groupId,
        title: <GroupHeader data={data} depth={depth} />,
        children: [
          ...childrenDevice.map((e) => {
            return {
              key: `device-${e.deviceId}`,
              title: (
                <DeviceItem
                  data={e}
                  onClick={(e) => onDeviceItemClick?.(e)}
                  prefix={deviceItemPrefix?.(e)}
                  suffix={deviceItemSuffix?.(e)}
                  bottom={deviceItemBottom?.(e)}
                />
              ),
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
      [data, isOnline, isTask, isNotTask, deviceItemPrefix, compareFn],
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

    const hiddenDeviceIds = useDeviceFilterConfigStore((s) => s.hiddenDeviceIds)
    const updateHiddenGroupIds = useDeviceFilterConfigStore(
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
    }, [data, hiddenDeviceIds, compareFn])

    const wrapperRef = useRef<HTMLDivElement>(null)
    const size = useSize(wrapperRef)

    return (
      <div className="h-full" ref={wrapperRef}>
        <Spin spinning={isLoading}>
          <Provider value={expandKeys}>
            <XTree
              treeData={treeData}
              defaultExpandAll
              expandedKeys={expandKeys}
              height={size?.height}
              onSelect={handleSelect}
            />
          </Provider>
        </Spin>
      </div>
    )
  },
)

SourceTree.displayName = 'SourceTree'

export default SourceTree
