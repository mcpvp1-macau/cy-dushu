import XCard from '@/components/ui/XCard'
import HNumber from '../../edit/components/HNumber'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import coverageImg from '../../area-wayline/assets/coverage.png'
import useSwarmWaylineStore from '@/store/wayline/uav-swarm-wayline/useSwarmWayline.store'

type PropsType = unknown

/** 覆盖率 */
const Coverage: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const coverage = useSwarmWaylineStore((s) => s.templateConfig.coverage)
  const updateTemplateConfig = useSwarmWaylineStore(
    (s) => s.updateTemplateConfig,
  )
  return (
    <XCard
      title={
        <div className="flex items-center gap-1">
          {t('wayline.waylineConfig.coverage.title')}
          <Tooltip
            className="ml-1"
            title={
              <div className="flex flex-col items-center gap-1">
                <p>{t('wayline.waylineConfig.coverage.tooltip')}</p>
                <img src={coverageImg} className="w-40" alt="coverage" />
              </div>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        </div>
      }
    >
      <HNumber
        className="mt-3"
        negatives={[-10, -1]}
        positives={[1, 10]}
        value={coverage}
        unit="%"
        max={90}
        onChange={(e) => {
          updateTemplateConfig({
            coverage: e,
          })
        }}
      />
    </XCard>
  )
})

Coverage.displayName = 'Coverage'

export default Coverage
