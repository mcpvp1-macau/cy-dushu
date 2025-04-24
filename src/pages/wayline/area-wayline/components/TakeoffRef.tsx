import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import TextButton from '@/components/ui/button/TextButton'
import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'

type PropsType = unknown

/** 起飞点 */
const TakeoffRef: FC<PropsType> = memo(() => {
  const takeOffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const updateIsDrawHome = useAreaWaylineStore((s) => s.updateIsDrawHome)

  const { t } = useTranslation()

  return (
    <XCard
      title={
        takeOffRefPoint
          ? t('wayline.takeoffRefPoint.setted.title')
          : t('wayline.takeoffRefPoint.notSetted.title')
      }
      topRight={
        <TextButton onClick={() => updateIsDrawHome(true)}>
          <IconTakeoff className="mr-1" />
          {takeOffRefPoint ? t('common.reset') : t('common.set')}
        </TextButton>
      }
    />
  )
})

TakeoffRef.displayName = 'TakeoffRef'

export default TakeoffRef
