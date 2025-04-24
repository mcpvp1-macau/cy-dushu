import XCard from '@/components/ui/XCard'
import HNumber from '@/pages/wayline/edit/components/HNumber'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { round } from 'lodash'

const SpeedConfig: FC<unknown> = () => {
  const { t } = useTranslation()

  const speed = useRebotDogWaylineStore((s) => s.waylineConfig.speed)
  const setWaylineConfig = useRebotDogWaylineStore((s) => s.updateWaylineConfig)

  return (
    <XCard title={t('wayline.waylineConfig.speedRebotDog.title')}>
      <div style={{ marginTop: '12px' }}>
        <HNumber
          value={speed}
          unit="m/s"
          min={0.1}
          max={3.8}
          step={0.1}
          onChange={(e) => {
            setWaylineConfig({
              ...useRebotDogWaylineStore.getState().waylineConfig,
              speed: Math.max(round(e, 1), 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

export default SpeedConfig
