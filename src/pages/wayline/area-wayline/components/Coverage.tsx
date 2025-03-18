import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'
import { calcFovRadiation } from '@/utils/fov'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import coverageImg from '../assets/coverage.png'

type PropsType = unknown

/** 覆盖率 */
const Coverage: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const cameraInfo = useAreaWaylineStore((s) => s.cameraInfo)

  const hFov = useMemo(
    () =>
      calcFovRadiation(
        cameraInfo?.focal ?? 24,
        cameraInfo?.sensorWidth ?? 40,
        1,
      ),
    [cameraInfo],
  )

  const coverage = useAreaWaylineStore((s) => s.templateConfig.coverage)
  const updateTemplateConfig = useAreaWaylineStore(
    (s) => s.updateTemplateConfig,
  )
  const height = useAreaWaylineStore((s) => s.airlineConfig.height)

  const takeoffPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )

  useEffect(() => {
    const lat = takeoffPoint?.[1] ?? 30
    const w = hFov * height * Math.abs(Math.cos((lat * Math.PI) / 180))
    updateTemplateConfig({
      interval: w * (1 - coverage / 100),
    })
  }, [coverage, height])

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
