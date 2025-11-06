import IconWarZone from '@/assets/icons/jsx/IconWarZone'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import {
  data,
  shanghaiWarZoneEmitter,
  warZoneCallSigns,
} from './ShanghaiWarZone'
import XModal from '@/components/XModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import IconButton from '@/components/ui/button/IconButton'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import useShanghaiWarZoneStore from '@/store/map/useShanghaiWarZone.store'
import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import { Input } from 'antd'
import { EventDataNode } from 'antd/es/tree'
import XTree from '@/components/ui/XTree'

type PropsType = unknown

const ShanghaiWarZoneConfig: FC<PropsType> = memo(() => {
  const group = useMemo(() => {
    const group: Record<string, [string, number][]> = {}

    data.features.forEach((item) => {
      const folder = item.properties!.folder
      const name = item.properties!.name
      const id = item.properties!.id
      if (!group[folder]) {
        group[folder] = []
      }
      group[folder].push([name, id])
    })
    return group
  }, [data])

  const [open, { toggle }] = useBoolean(false)

  const hiddenZones = useShanghaiWarZoneStore((s) => s.hiddenZones)
  const updateHiddenZones = useShanghaiWarZoneStore((s) => s.updateHiddenZones)

  const handleToggleVisibility = (zoneId: number) => {
    const newHiddenZones = new Set(hiddenZones)
    if (newHiddenZones.has(zoneId)) {
      newHiddenZones.delete(zoneId)
    } else {
      newHiddenZones.add(zoneId)
    }
    updateHiddenZones(newHiddenZones)
  }

  const handleToggleGroupVisibility = (groupName: string) => {
    const newHiddenZones = new Set(hiddenZones)
    const groupItems = group[groupName] || []

    // Check if at least one item in the group is visible
    const hasVisibleItem = groupItems.some(([, id]) => !hiddenZones.has(id))

    if (hasVisibleItem) {
      // If at least one is visible, hide all items in the group
      groupItems.forEach(([, id]) => {
        newHiddenZones.add(id)
      })
    } else {
      // If all are hidden, show all items in the group
      groupItems.forEach(([, id]) => {
        newHiddenZones.delete(id)
      })
    }

    updateHiddenZones(newHiddenZones)
  }

  const [expandedKeys, setExpandedKeys] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const handleSearch = (value: string) => {
    if (!value) {
      setExpandedKeys([])
      setSearchValue('')
      return
    }
    setSearchValue(value)
    const keys = data.features
      .filter((e) => e.properties!.name.includes(value))
      .map((e) => e.properties!.id)
    setExpandedKeys(keys)
  }

  const treeData = useMemo<any[] | undefined>(() => {
    return Object.entries(group).map(([groupName, children]) => ({
      key: groupName,
      title: (
        <div className="flex justify-between items-center pl-2 pr-3 py-1">
          <p>{groupName}</p>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              handleToggleGroupVisibility(groupName)
            }}
          >
            {children.some(([, id]) => !hiddenZones.has(id)) ? (
              <IconVisible />
            ) : (
              <IconNotVisible />
            )}
          </IconButton>
        </div>
      ),
      children: children
        .filter(([name]) => !searchValue || name.includes(searchValue))
        .map(([name, id]) => {
          const idx = name.indexOf(searchValue)
          const node =
            idx > -1 ? (
              <>
                <span>{name.slice(0, idx)}</span>
                <span className="text-red-500">
                  {name.slice(idx, idx + searchValue.length)}
                </span>
                <span>{name.slice(idx + searchValue.length)}</span>
              </>
            ) : (
              <span>{name}</span>
            )

          return {
            key: id,
            isLeaf: true,
            title: (
              <div className="flex justify-between items-center pl-4 pr-3 py-1 w-[350px]">
                <p className="max-w-[210px] truncate">
                  {node}
                  {warZoneCallSigns.has(name) ? ' ☆' : ''}
                </p>
                <div>
                  <IconButton
                    onClick={() => shanghaiWarZoneEmitter.emit('fitZone', id)}
                  >
                    <IconToLocation />
                  </IconButton>
                  <IconButton
                    className="ml-3"
                    onClick={() => handleToggleVisibility(id)}
                  >
                    {hiddenZones.has(id) ? <IconNotVisible /> : <IconVisible />}
                  </IconButton>
                </div>
              </div>
            ),
          }
        }),
    }))
  }, [group, searchValue, hiddenZones])

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
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter((k) => k !== key))
    } else {
      setExpandedKeys([...expandedKeys, key])
    }
  }

  return (
    <>
      <FloatIconButton
        toolTipProps={{ title: '战区呼号', placement: 'left' }}
        onClick={toggle}
      >
        <IconWarZone />
      </FloatIconButton>
      <XModal
        open={open}
        onClose={toggle}
        title="战区呼号"
        noPadding
        footer={false}
        width={350}
        centered
      >
        <div className="p-3">
          <Input.Search
            placeholder="请输入搜索关键字"
            onSearch={handleSearch}
          />
        </div>
        <ScrollArea className="max-h-[60vh] w-[350px]">
          <XTree
            treeData={treeData}
            autoExpandParent
            expandedKeys={expandedKeys}
            onSelect={handleSelect}
          />
        </ScrollArea>
      </XModal>
    </>
  )
})

ShanghaiWarZoneConfig.displayName = 'ShanghaiWarZoneConfig'

export default ShanghaiWarZoneConfig
