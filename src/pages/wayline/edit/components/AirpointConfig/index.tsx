import { Button, Popconfirm } from 'antd'
import Actions from './Actions'
import ActionConfig from './Actions/ActionConfig'
import AppEmpty from '@/components/AppEmpty'
import { useMemoizedFn } from 'ahooks'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import AirpointAddAction from './Actions/AddAction'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StopOutlined } from '@ant-design/icons'
import { useLayoutEffect } from 'react'

type PropsType = {
  info: ReactNode
}

const AirpointConfig: FC<PropsType> = ({ info }) => {
  const [activeAction, setActiveAction] = useState<string>('')

  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const airpointsConfig = useAirlineConfigStore((s) => s.airpointsConfig)
  const isDrawPoint = useAirlineConfigStore((s) => s.isDrawPoint)
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const prevAirPoint = useAirlineConfigStore((s) => s.prevAirPoint)
  const nextAirPoint = useAirlineConfigStore((s) => s.nextAirPoint)
  const setIsDrawPoint = useAirlineConfigStore((s) => s.updateIsDrawPoint)
  const setCurrentActionIndex = useAirlineConfigStore(
    (s) => s.updateCurrentActionIndex,
  )
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)
  const setAirpointsConfig = useAirlineConfigStore(
    (s) => s.updateAirpointsConfig,
  )

  useLayoutEffect(() => {
    setCurrentActionIndex(0)
    setActiveAction(airpointsConfig[currentIndex]?.actions?.[0]?.xid || '')
  }, [currentIndex])

  const handleTakeoffClick = () => {
    if (isDrawPoint) {
      setIsDrawPoint(false)
    } else {
      setIsDrawPoint(true)
      setIsDrawHome(false)
    }
  }

  const handleDelteAllConfirm = useMemoizedFn(() => {
    setAirpointsConfig([])
  })

  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      {info}
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
              disabled={!takeOffRefPoint}
              onClick={handleTakeoffClick}
            >
              {takeOffRefPoint ? (
                isDrawPoint ? (
                  t('wayline.waylinePoint.cancelCreateWaypoint.title')
                ) : (
                  t('wayline.waylinePoint.createWaypoint.title')
                )
              ) : (
                <StopOutlined />
              )}
            </Button>
          </>
        }
      >
        {airpointsConfig.length === 0 ? (
          <>
            <AppEmpty />
          </>
        ) : (
          <>
            <div className="mt-3 flex justify-center items-center">
              <Button
                size="small"
                icon={<IconLeft />}
                onClick={() => {
                  prevAirPoint()
                }}
              />
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
              <AirpointAddAction setActiveOperator={setActiveAction} />
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
