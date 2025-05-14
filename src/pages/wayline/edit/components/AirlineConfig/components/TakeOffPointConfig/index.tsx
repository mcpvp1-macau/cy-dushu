import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import { Button, Tooltip } from 'antd'
import { round } from 'lodash'
import HNumber from '../../../HNumber'
import { InfoCircleOutlined } from '@ant-design/icons'

type PropsType = unknown

/** 参考起飞点设置 */
const TakeOffPointConfig: FC<PropsType> = () => {
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)
  const { t } = useTranslation()
  return (
    <XCard
      title={
        takeOffRefPoint ? (
          <div>
            {t('wayline.takeoffRefPoint.setted.title')}{' '}
            <Tooltip title={t('wayline.takeoffRefPoint.setted.tooltip')}>
              <InfoCircleOutlined className="text-fore" />
            </Tooltip>
          </div>
        ) : (
          t('wayline.takeoffRefPoint.notSetted.title')
        )
      }
      topRight={
        <Button
          type="link"
          icon={<IconTakeoff />}
          size="small"
          onClick={() => setIsDrawHome(true)}
        >
          {takeOffRefPoint ? t('common.reset') : t('common.set')}
        </Button>
      }
    >
      {takeOffRefPoint && (
        <HNumber
          className="mt-3"
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={round(takeOffRefPoint[2], 1)}
          unit="m"
          max={globalConfig.uavHeightLimit}
          onChange={(e) => {
            useAirlineConfigStore.getState().updateAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              takeOffRefPoint: [takeOffRefPoint[0], takeOffRefPoint[1], e],
            })
          }}
        />
      )}
    </XCard>
  )
}

/** 参考起飞点设置 */
const memorizedCpn = memo(TakeOffPointConfig)
memorizedCpn.displayName = 'TakeOffPointConfig'

export default memorizedCpn
