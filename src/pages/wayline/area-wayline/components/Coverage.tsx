import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'

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
