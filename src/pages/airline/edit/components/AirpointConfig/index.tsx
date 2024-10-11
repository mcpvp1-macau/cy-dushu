import { FC, ReactNode, useRef, useState } from 'react'
import styles from './index.module.less'
import { Button, Popconfirm } from 'antd'
import Actions from './Actions'
import ActionConfig from './Actions/ActionConfig'
import AppEmpty from '@/components/AppEmpty'
import { useMemoizedFn } from 'ahooks'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import AirpointAddAction from './Actions/AddAction'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

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

  const lastCurrentIndex = useRef(currentIndex)
  if (lastCurrentIndex.current !== currentIndex) {
    lastCurrentIndex.current = currentIndex
    setCurrentActionIndex(0)
    setActiveAction(airpointsConfig[currentIndex]?.actions?.[0]?.xid || '')
  }

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

  return (
    <div className={styles.mainContent}>
      {info}
      <XCard
        title={
          <Popconfirm
            title="一键删除所有航点"
            description="删除后航点内容将不可恢复, 确定删除航点吗?"
            placement="right"
            onConfirm={handleDelteAllConfirm}
          >
            <span style={{ marginRight: '4px' }}>航点列表</span>
            <IconButton toolTipProps={{ title: '一键删除所有航点' }}>
              <IconDelete />
            </IconButton>
          </Popconfirm>
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
              {takeOffRefPoint
                ? isDrawPoint
                  ? '取消新增'
                  : '新增航点'
                : '请先设置起飞点'}
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
            <div className={styles.airpointSwitch}>
              <Button
                size="small"
                icon={<IconLeft />}
                onClick={() => {
                  prevAirPoint()
                }}
              />
              <div className={styles.importantInfo}>{currentIndex + 1}</div>
              <Button
                size="small"
                icon={<IconRight />}
                onClick={() => {
                  nextAirPoint()
                }}
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
            <div className={styles.splitLine} />
            <ActionConfig activeOperator={activeAction} />
          </>
        )}
      </XCard>
    </div>
  )
}

export default AirpointConfig
