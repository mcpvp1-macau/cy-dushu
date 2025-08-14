import XCard from '@/components/ui/XCard'
import HNumber from '@/pages/wayline/edit/components/HNumber'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { round } from 'lodash'

const SpeedConfig: FC<unknown> = () => {
  const { t } = useTranslation()

  const speed = usePointCloud3DWaylineStore((s) => s.waylineConfig.speed)

  return (
    <XCard title={t('wayline.waylineConfig.speedRebotDog.title')}>
      <div style={{ marginTop: '12px' }}>
        <HNumber
          value={speed}
          unit="m/s"
          min={0.2}
          max={1.5}
          step={0.1}
          onChange={(e) => {
            const sto = usePointCloud3DWaylineStore.getState()
            sto.updateWaylineConfig({
              ...sto.waylineConfig,
              speed: Math.max(round(e, 1), 0.2),
            })
          }}
        />
      </div>
    </XCard>
  )
}

export default SpeedConfig
