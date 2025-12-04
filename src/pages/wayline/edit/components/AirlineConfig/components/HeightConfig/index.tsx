import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import { Radio } from 'antd'
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import LiqunTippy from '@/components/ui/LiqunTippy'
import { round } from 'lodash'

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
          <LiqunTippy content={t('wayline.waylineConfig.height.tooltip')}>
            <InfoCircleOutlined className="text-fore" />
          </LiqunTippy>
        </div>
      }
    >
      <Radio.Group
        style={{ width: '100%' }}
        value={heightMode}
        optionType="button"
        buttonStyle="solid"
        onChange={(e) => {
          setAirlineConfig({
            ...useAirlineConfigStore.getState().airlineConfig,
            executeHeightMode: e.target.value,
          })
        }}
      >
        <Radio.Button className="flex-1" value="relativeToStartPoint">
          {t('wayline.waylineConfig.relativeHeight.title')}
          <LiqunTippy
            content={t('wayline.waylineConfig.relativeHeight.tooltip')}
          >
            <QuestionCircleOutlined className="ml-1" />
          </LiqunTippy>
        </Radio.Button>
        <Radio.Button className="flex-1" value="WGS84">
          {t('wayline.waylineConfig.altitudeHeight.title')}
        </Radio.Button>
      </Radio.Group>
      <div style={{ marginTop: '12px' }}>
        <HNumber
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={round(height, 2)}
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
