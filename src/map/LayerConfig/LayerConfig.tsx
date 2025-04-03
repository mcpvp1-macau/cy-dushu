import IconLayer from '@/assets/icons/jsx/IconLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { memo, type FC } from 'react'
import MapLayerSettingModal from './SettingModal'

type PropsType = unknown

const MapLayerConfig: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle, setFalse }] = useBoolean(false)
  return (
    <div>
      <FloatIconButton
        toolTipProps={{
          title: t('mapLayer.setting.layer.title'),
          placement: 'left',
          mouseEnterDelay: 0.3,
        }}
        onClick={toggle}
      >
        <IconLayer />
      </FloatIconButton>
      {open && <MapLayerSettingModal open={open} onClose={setFalse} />}
    </div>
  )
})

MapLayerConfig.displayName = 'MapLayerConfig'

export default MapLayerConfig
