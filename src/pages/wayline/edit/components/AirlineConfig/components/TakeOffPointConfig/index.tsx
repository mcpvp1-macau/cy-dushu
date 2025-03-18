import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import { Button } from 'antd'

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
        takeOffRefPoint
          ? t('wayline.takeoffRefPoint.setted.title')
          : t('wayline.takeoffRefPoint.notSetted.title')
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
    />
  )
}

/** 参考起飞点设置 */
const memorizedCpn = memo(TakeOffPointConfig)
memorizedCpn.displayName = 'TakeOffPointConfig'

export default memorizedCpn
