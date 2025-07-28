import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'
import { round } from 'lodash'

type PropsType = unknown

/** 高度设置 */
const HeightConfig: FC<PropsType> = memo(() => {
  const height = useAreaWaylineStore((s) => s.airlineConfig.height)
  const setAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)
  const { t } = useTranslation()

  return (
    <XCard title={t('wayline.waylineConfig.atl.title')}>
      <HNumber
        className="mt-3"
        negatives={[-100, -10]}
        positives={[10, 100]}
        value={round(height, 1)}
        unit="m"
        max={500}
        onChange={(h) => {
          setAirlineConfig({
            height: Math.max(h, 0),
            takeOffSecurityHeight: Math.max(h, 0),
          })
          const c = useAreaWaylineStore.getState().cameraInfo
          const wideGSD = ((h * c.sensorWidth) / (c.focal * c.pixelWidth)) * 100
          const state = useAreaWaylineStore.getState()
          state.updateTemplateConfig({
            ...state.templateConfig,
            wideGSD: round(wideGSD, 2),
          })
        }}
      />
    </XCard>
  )
})

HeightConfig.displayName = 'HeightConfig'

export default HeightConfig
