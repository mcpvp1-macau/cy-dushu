import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconWarZone from '@/assets/icons/jsx/IconWarZone'
import XModal from '@/components/XModal'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import XTree from '@/components/ui/XTree'
import useXiaoshanXZZoneStore from '@/store/map/useXiaoshanXZZone.store'
import { Input } from 'antd'
import { EventDataNode } from 'antd/es/tree'
import { XiaoshanXZZoneEmitter, data } from './XiaoshanXZZone'

type PropsType = unknown

const ROOT_KEY = 'xiaoshan-zone'

const XiaoshanXZZoneConfig: FC<PropsType> = memo(() => {
  const [open, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false)
  const hiddenZones = useXiaoshanXZZoneStore((s) => s.hiddenZones)
  const updateHiddenZones = useXiaoshanXZZoneStore((s) => s.updateHiddenZones)

  const allZoneIds = useMemo(() => {
    return data.features.map((item) => item.properties!.id)
  }, [data])

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    data.features.length ? [ROOT_KEY] : [],
  )
  const [searchValue, setSearchValue] = useState<string>('')

  const handleToggleVisibility = useMemoizedFn((zoneId: number) => {
    const nextHidden = new Set(hiddenZones)
    if (nextHidden.has(zoneId)) {
      nextHidden.delete(zoneId)
    } else {
      nextHidden.add(zoneId)
    }
    updateHiddenZones(nextHidden)
  })

  const handleHideAll = useMemoizedFn(() => {
    const nextHidden = new Set(hiddenZones)
    allZoneIds.forEach((id) => nextHidden.add(id))
    updateHiddenZones(nextHidden)
  })

  const handleShowAll = useMemoizedFn(() => {
    const nextHidden = new Set(hiddenZones)
    allZoneIds.forEach((id) => nextHidden.delete(id))
    updateHiddenZones(nextHidden)
  })

  const handleSearch = useMemoizedFn((value: string) => {
    const keyword = value.trim()
    setSearchValue(keyword)
    if (!keyword) {
      setExpandedKeys(data.features.length ? [ROOT_KEY] : [])
      return
    }
    setExpandedKeys([ROOT_KEY])
  })

  const treeData = useMemo<any[]>(() => {
    const filteredFeatures = data.features.filter((feature) => {
      if (!searchValue) return true
      return feature.properties!.name.includes(searchValue)
    })

    const children = filteredFeatures.map((feature) => {
      const { id, name } = feature.properties!
      const matchIdx = searchValue ? name.indexOf(searchValue) : -1

      const label =
        matchIdx > -1 ? (
          <>
            <span>{name.slice(0, matchIdx)}</span>
            <span className="text-red-500">
              {name.slice(matchIdx, matchIdx + searchValue.length)}
            </span>
            <span>{name.slice(matchIdx + searchValue.length)}</span>
          </>
        ) : (
          <span>{name}</span>
        )

      return {
        key: id,
        isLeaf: true,
        title: (
          <div className="flex justify-between items-center pl-4 pr-3 py-1 w-[350px]">
            <p className="max-w-[210px] truncate">{label}</p>
            <div>
              <IconButton
                onClick={() => XiaoshanXZZoneEmitter.emit('fitZone', id)}
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
    })

    return [
      {
        key: ROOT_KEY,
        title: (
          <div className="flex justify-between items-center pl-2 pr-3 py-1">
            <p>萧山区行政区域</p>
            <IconButton
              onClick={(event) => {
                event.stopPropagation()
                const hasVisible = allZoneIds.some((id) => !hiddenZones.has(id))
                if (hasVisible) {
                  handleHideAll()
                } else {
                  handleShowAll()
                }
              }}
            >
              {allZoneIds.some((id) => !hiddenZones.has(id)) ? (
                <IconVisible />
              ) : (
                <IconNotVisible />
              )}
            </IconButton>
          </div>
        ),
        children,
      },
    ]
  }, [
    allZoneIds,
    handleHideAll,
    handleShowAll,
    handleToggleVisibility,
    hiddenZones,
    searchValue,
  ])

  const handleSelect = useMemoizedFn(
    (
      _: React.Key[],
      info: {
        event: 'select'
        selected: boolean
        node: EventDataNode<any>
        selectedNodes: any[]
        nativeEvent: MouseEvent
      },
    ) => {
      if (info.node.isLeaf) return
      const { key } = info.node
      if (expandedKeys.includes(key)) {
        setExpandedKeys(expandedKeys.filter((item) => item !== key))
      } else {
        setExpandedKeys([...expandedKeys, key])
      }
    },
  )

  return (
    <>
      <FloatIconButton
        toolTipProps={{ title: '行政区域', placement: 'left' }}
        onClick={openModal}
      >
        <IconWarZone />
      </FloatIconButton>
      <XModal
        open={open}
        onClose={closeModal}
        title="行政区域"
        noPadding
        footer={false}
        width={350}
        centered
      >
        <div className="p-3">
          <Input.Search
            placeholder="请输入搜索关键字"
            allowClear
            value={searchValue}
            onSearch={handleSearch}
            onChange={(event) => handleSearch(event.target.value)}
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

XiaoshanXZZoneConfig.displayName = 'XiaoshanXZZoneConfig'

export default XiaoshanXZZoneConfig
