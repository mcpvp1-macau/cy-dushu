import SnackBar from '@/components/ui/SnackBar'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

/** 没有时起飞点展示 */
const NotTakeoffWarning: FC<PropsType> = () => {
  const takeOff = useAirlineConfigStore(
    (s) => !!s.airlineConfig.takeOffRefPoint,
  )

  const { t } = useTranslation()

  return (
    <SnackBar open={!takeOff}>
      {t('wayline.waylineConfig.noTakeoffPointError.msg')}
    </SnackBar>
  )
}

export default memo(NotTakeoffWarning)
