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
  data: API_DEVICE.res.DeviceTreeV4Res
  onDeviceItemClick?: (data: API_DEVICE.domain.Device) => void
  deviceItemPrefix?: (data: API_DEVICE.domain.Device) => ReactNode
  deviceItemSuffix?: (data: API_DEVICE.domain.Device) => ReactNode
  deviceItemBottom?: (data: API_DEVICE.domain.Device) => ReactNode
  compareFn?: (
    a: API_DEVICE.domain.Device,
    b: API_DEVICE.domain.Device,
  ) => number
}

/** 设备树 V4，该组件为虚拟列表，请确保父容器的高度 */
const SourceTreeV4: FC<PropsType> = memo(
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
      group: API_DEVICE.domain.DeviceTreeV4Item,
      depth = 0,
    ) => {
      const children = group?.children ?? []
      const devices = group?.devices ?? []

      const childrenDevice = devices.filter((e) =>
        deviceStatusFilter(e, isOnline, isTask, isNotTask),
      )

      if (compareFn) {
        childrenDevice.sort((a, b) => compareFn(a, b))
      }

      const sortedChildren = [...children].sort((a, b) => {
        // 业务规则：优先按 orderId 排序，便于后端控制展示顺序
        const aOrder = a?.orderId ?? Number.MAX_SAFE_INTEGER
        const bOrder = b?.orderId ?? Number.MAX_SAFE_INTEGER

        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }

        return (a?.groupName ?? '').localeCompare(b?.groupName ?? '')
      })

      return {
        key: group?.groupId ?? '',
        title: <GroupHeader data={group} depth={depth} />,
        children: [
          ...childrenDevice.map((device) => {
            return {
              key: `device-${device.deviceId ?? ''}`,
              title: (
                <DeviceItem
                  data={device}
                  onClick={(e) => onDeviceItemClick?.(e)}
                  prefix={deviceItemPrefix?.(device)}
                  suffix={deviceItemSuffix?.(device)}
                  bottom={deviceItemBottom?.(device)}
                />
              ),
              isLeaf: true,
            }
          }),
          ...sortedChildren
            .map((child) => resolveGroup(child, depth + 1))
            .filter((item: any) => item.children.length > 0),
        ],
      }
    }

    const roots = data?.roots ?? []
    const rootKeys = roots
      .map((root) => root?.groupId)
      .filter((id): id is string => Boolean(id))
    const rootKeySignature = useMemo(() => rootKeys.join('|'), [rootKeys])

    const treeData = useMemo(
      () => roots.map((root) => resolveGroup(root)),
      [
        roots,
        isOnline,
        isTask,
        isNotTask,
        deviceItemPrefix,
        compareFn,
      ],
    )

    const [expandKeys, setExpandKeys] = useState<React.Key[]>(rootKeys)

    useEffect(() => {
      setExpandKeys(rootKeys)
    }, [rootKeySignature])

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
      const dfs = (group: API_DEVICE.domain.DeviceTreeV4Item) => {
        if (!group?.groupId) {
          return true
        }
        newHiddenGroupIds[group.groupId] =
          // every 自带短路, 需要先 map, 确保所有 group 都能遍历到, 并且需要放在筛设备前
          (group.children?.map?.(dfs)?.every((e) => e) ?? true) &&
          (group.devices?.every?.((d) => hiddenDeviceIds[d.deviceId]) ?? true)
        return newHiddenGroupIds[group.groupId]
      }

      roots.forEach((root) => dfs(root))
      updateHiddenGroupIds(newHiddenGroupIds)
    }, [roots, hiddenDeviceIds, compareFn])

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

SourceTreeV4.displayName = 'SourceTreeV4'

export default SourceTreeV4
