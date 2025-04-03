import IconWarZone from '@/assets/icons/jsx/IconWarZone'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { data, warZoneCallSigns } from './ShanghaiWarZone'
import XModal from '@/components/XModal'
import AppCollapse from '@/components/AppCollapse'
import { ScrollArea } from '@/components/ui/scroll-area'
import IconButton from '@/components/ui/button/IconButton'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import useShanghaiWarZoneStore from '@/store/map/useShanghaiWarZone.store'

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
        <ScrollArea className="max-h-[80vh] w-[350px]">
          <AppCollapse
            items={Object.entries(group).map(([groupName, children]) => ({
              label: (
                <div className="flex justify-between items-center">
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
              key: groupName,
              children: (
                <div className="p-3 flex flex-col gap-2">
                  {children.map(([name, id]) => (
                    <div
                      key={id}
                      className="flex justify-between items-center "
                    >
                      <p className="max-w-[210px] truncate">
                        {name}
                        {warZoneCallSigns.has(name) ? ' ☆' : ''}
                      </p>
                      <IconButton onClick={() => handleToggleVisibility(id)}>
                        {hiddenZones.has(id) ? (
                          <IconNotVisible />
                        ) : (
                          <IconVisible />
                        )}
                      </IconButton>
                    </div>
                  ))}
                </div>
              ),
            }))}
          />
        </ScrollArea>
      </XModal>
    </>
  )
})

ShanghaiWarZoneConfig.displayName = 'ShanghaiWarZoneConfig'

export default ShanghaiWarZoneConfig
