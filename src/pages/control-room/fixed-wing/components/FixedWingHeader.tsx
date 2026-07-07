import IconBack from '@/assets/icons/jsx/IconBack'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconButton from '@/components/ui/button/IconButton'
import {
  FIXED_WING_DEMO_TELEMETRY,
  FIXED_WING_HEALTH_STATES,
} from '@/demo/fixed-wing/constants'
import useFixedWingDemoStore from '@/demo/fixed-wing/useFixedWingDemo.store'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip } from 'antd'
import { useTitle } from 'ahooks'
import { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

type PropsType = {
  deviceName: string
}

const telemetry = FIXED_WING_DEMO_TELEMETRY

/** 遥测项（与无人机驾驶舱顶栏样式保持一致） */
const I: FC<
  { l: ReactNode; v: ReactNode; t?: string } & HTMLAttributes<HTMLElement>
> = ({ l, v, t, ...props }) => {
  return (
    <li className="flex gap-1 select-none" {...props}>
      {!l ? null : t ? <Tooltip title={t}>{l}</Tooltip> : <div>{l}</div>}
      <div>{v}</div>
    </li>
  )
}

const HeaderLeft: FC<{ deviceName: string }> = memo(({ deviceName }) => {
  const navigate = useNavigate()

  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  return (
    <section className="flex items-center gap-3">
      <IconButton className="text-base" onClick={() => navigate(-1)}>
        <IconBack />
      </IconButton>
      <h3 className="whitespace-nowrap">{deviceName} 驾驶舱</h3>
    </section>
  )
})

HeaderLeft.displayName = 'FixedWingHeaderLeft'

/** 固定翼驾驶舱顶栏（结构与无人机驾驶舱一致） */
const FixedWingHeader: FC<PropsType> = memo(({ deviceName }) => {
  const healthIndex = useFixedWingDemoStore((s) => s.healthIndex)
  const isHealthy = healthIndex === 0
  const healthText = FIXED_WING_HEALTH_STATES[healthIndex] ?? '正常'

  const appHeader = document.getElementById('app-header-center')

  const h = (
    <header className="flex justify-between items-center text-sm px-3">
      {appHeader ? <HeaderLeft deviceName={deviceName} /> : <div />}
      <ScrollArea className="w-full h-full flex items-center ml-3">
        <div className="flex items-center gap-3">
          <section className="grow">
            <ul className="flex justify-center gap-1 xl:gap-3 2xl:gap-5 whitespace-nowrap">
              <I t="链路类型" l="Link" v={telemetry.linkType} />
              <I
                t="飞机油量"
                l={<IconBattery />}
                v={<span>{telemetry.fuel}%</span>}
              />
              <I
                t="系统自检"
                l="系统"
                v={
                  <span className={isHealthy ? 'text-green-500' : 'text-red-500'}>
                    {isHealthy ? '正常' : healthText}
                  </span>
                }
              />
              <I
                t="地速"
                l="H.S"
                v={<span>{telemetry.groundSpeed.toFixed(1)} m/s</span>}
              />
              <I
                t="飞行高度"
                l="ALT"
                v={<span>{telemetry.relativeHeight.toFixed(1)} m</span>}
              />
              <I
                t="海拔高度"
                l="ASL"
                v={<span>{telemetry.asl.toFixed(1)} m</span>}
              />
              <I
                t="任务状态"
                l={null}
                v={<span className="text-primary">任务执行中</span>}
              />
            </ul>
          </section>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </header>
  )

  if (appHeader) {
    return createPortal(h, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{h}</div>
})

FixedWingHeader.displayName = 'FixedWingHeader'

export default FixedWingHeader
