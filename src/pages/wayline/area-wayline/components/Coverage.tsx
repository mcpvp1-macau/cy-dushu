import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'
import coverageImg from '../assets/coverage.png'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

type PropsType = unknown

/** 覆盖率 */
const Coverage: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const photoWaylineCoverage = useAreaWaylineStore(
    (s) => s.templateConfig.photoWaylineCoverage,
  )

  const updateConfig = useAreaWaylineStore((s) => s.updateTemplateConfig)

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
        value={Math.floor(photoWaylineCoverage * 100)}
        unit="%"
        max={90}
        onChange={(e) => {
          updateConfig({
            photoWaylineCoverage: e / 100,
          })
        }}
      />
    </XCard>
  )
})

Coverage.displayName = 'Coverage'

export default Coverage
