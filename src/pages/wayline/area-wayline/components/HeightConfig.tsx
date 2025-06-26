import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'
import { calcFovRadiation } from '@/utils/fov'
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
        value={height}
        unit="m"
        max={500}
        onChange={(e) => {
          setAirlineConfig({
            height: Math.max(e, 0),
            takeOffSecurityHeight: Math.max(e, 0),
          })
          const hFov = calcFovRadiation(4.5, 6.4, 1)
          const wideGSD = round(((2 * e * Math.tan(hFov / 2)) / 4000) * 100, 2)
          const state = useAreaWaylineStore.getState()
          state.updateTemplateConfig({
            ...state.templateConfig,
            wideGSD: wideGSD,
          })
        }}
      />
    </XCard>
  )
})

HeightConfig.displayName = 'HeightConfig'

export default HeightConfig
