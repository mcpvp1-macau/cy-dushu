import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import { Radio, Tooltip } from 'antd'
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'

type PropsType = unknown

/** 航线高度设置 */
const AirlineHeightConfig: FC<PropsType> = () => {
  const height = useAirlineConfigStore((s) => s.airlineConfig.height)
  const heightMode = useAirlineConfigStore(
    (s) => s.airlineConfig.executeHeightMode ?? 'relativeToStartPoint',
  )
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)
  const { t } = useTranslation()

  return (
    <XCard
      title={
        <div>
          {t('wayline.waylineConfig.atl.title')}{' '}
          <Tooltip title={t('wayline.waylineConfig.height.tooltip')}>
            <InfoCircleOutlined className="text-fore" />
          </Tooltip>
        </div>
      }
    >
      <Radio.Group
        style={{ width: '100%' }}
        className="flex"
        options={[
          {
            label: (
              <div>
                相对高度{' '}
                <Tooltip
                  title={t('wayline.waylineConfig.relativeHeight.tooltip')}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
            ),
            value: 'relativeToStartPoint',
          },
          {
            label: '海拔高度',
            value: 'WGS84',
          },
        ]}
        value={heightMode}
        optionType="button"
        buttonStyle="solid"
        onChange={(e) => {
          setAirlineConfig({
            ...useAirlineConfigStore.getState().airlineConfig,
            executeHeightMode: e.target.value,
          })
        }}
      />
      <div style={{ marginTop: '12px' }}>
        <HNumber
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={height}
          unit="m"
          max={globalConfig.uavHeightLimit}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              height: Math.max(e, 0),
              takeOffSecurityHeight: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

/** 航线高度设置 */
const memorizedCpn = memo(AirlineHeightConfig)
memorizedCpn.displayName = 'AirlineHeightConfig'

export default memorizedCpn
