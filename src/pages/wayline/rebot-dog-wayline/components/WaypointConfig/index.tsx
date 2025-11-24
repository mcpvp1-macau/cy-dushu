import { Button, Popconfirm } from 'antd'
import Actions from './Actions'
import AppEmpty from '@/components/AppEmpty'
import { useMemoizedFn } from 'ahooks'
import XCard from '@/components/ui/XCard'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import AddAction from './Actions/AddAction'
import ActionConfig from './Actions/ActionConfig'

type PropsType = unknown

const AirpointConfig: FC<PropsType> = () => {
  const [activeAction, setActiveAction] = useState('')

  const currentIndex = useRebotDogWaylineStore((s) => s.currentIndex)
  const airpointsConfig = useRebotDogWaylineStore((s) => s.waypointsConfig)
  const isDrawPoint = useRebotDogWaylineStore((s) => s.isDrawPoint)

  const prevAirPoint = useRebotDogWaylineStore((s) => s.prevWaypoint)
  const nextAirPoint = useRebotDogWaylineStore((s) => s.nextWaypoint)
  const setIsDrawPoint = useRebotDogWaylineStore((s) => s.updateIsDrawPoint)
  const setCurrentActionIndex = useRebotDogWaylineStore(
    (s) => s.updateCurrentActionIndex,
  )

  const setAirpointsConfig = useRebotDogWaylineStore(
    (s) => s.updateWaypointsConfig,
  )

  useEffect(() => {
    setCurrentActionIndex(0)
    setActiveAction(airpointsConfig[currentIndex]?.actions?.[0]?.xid || '')
  }, [currentIndex])

  const handleTakeoffClick = () => {
    if (isDrawPoint) {
      setIsDrawPoint(false)
    } else {
      setIsDrawPoint(true)
    }
  }

  const handleDelteAllConfirm = useMemoizedFn(() => {
    setAirpointsConfig([])
  })

  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 mt-3">
      <XCard
        title={
          <>
            <span className="mr-1">
              {t('wayline.waylinePoint.waypointList.title')}
            </span>
            <Popconfirm
              title={t('wayline.waylinePoint.deleteAllWaypoint.title')}
              description={t('wayline.waylinePoint.deleteAllWaypoint.question')}
              placement="right"
              onConfirm={handleDelteAllConfirm}
            >
              <IconButton
                tippyProps={{
                  content: t('wayline.waylinePoint.deleteAllWaypoint.title'),
                }}
              >
                <IconDelete />
              </IconButton>
            </Popconfirm>
          </>
        }
        style={{ flex: 1 }}
        topRight={
          <>
            <Button
              type="link"
              size="small"
              className="p-0"
              onClick={handleTakeoffClick}
            >
              {isDrawPoint
                ? t('wayline.waylinePoint.cancelCreateWaypoint.title')
                : t('wayline.waylinePoint.createWaypoint.title')}
            </Button>
          </>
        }
      >
        {airpointsConfig.length === 0 ? (
          <AppEmpty />
        ) : (
          <>
            <div className="mt-3 flex justify-center items-center">
              <Button size="small" icon={<IconLeft />} onClick={prevAirPoint} />
              <div className="flex-1 text-primary text-lg text-center">
                {currentIndex + 1}
              </div>
              <Button
                size="small"
                icon={<IconRight />}
                onClick={nextAirPoint}
              />
            </div>
            <div className="flex gap-3 justify-between overflow-hidden">
              <ScrollArea className="flex-1 max-w-[270px] py-2">
                <div className="flex gap-3">
                  <Actions
                    activeOperator={activeAction}
                    setActiveOperator={setActiveAction}
                  />
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <AddAction setActiveOperator={setActiveAction} />
            </div>
            <div className="h-[1px] bg-ground-5 rounded" />
            <ActionConfig activeOperator={activeAction} />
          </>
        )}
      </XCard>
    </div>
  )
}

export default AirpointConfig
