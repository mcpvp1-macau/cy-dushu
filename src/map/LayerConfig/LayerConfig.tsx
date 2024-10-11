import IconLayer from '@/assets/icons/jsx/IconLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { memo, type FC } from 'react'
import MapLayerSettingModal from './SettingModal'

type PropsType = unknown

const MapLayerConfig: FC<PropsType> = memo(() => {
  const [open, { toggle, setFalse }] = useBoolean(false)
  return (
    <div>
      <FloatIconButton
        toolTipProps={{ title: '图层', mouseEnterDelay: 0.3 }}
        onClick={toggle}
      >
        <IconLayer />
      </FloatIconButton>
      <MapLayerSettingModal open={open} onClose={setFalse} />
    </div>
  )
})

MapLayerConfig.displayName = 'MapLayerConfig'

export default MapLayerConfig
