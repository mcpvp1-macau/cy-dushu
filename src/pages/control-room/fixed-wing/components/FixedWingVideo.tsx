import useFixedWingDemoStore from '@/demo/fixed-wing/useFixedWingDemo.store'
import { DisconnectOutlined } from '@ant-design/icons'
import clsx from 'clsx'

type PropsType = unknown

/** 固定翼视频面板（视频流未接入, 保留传感器状态展示） */
const FixedWingVideo: FC<PropsType> = memo(() => {
  const sensorMode = useFixedWingDemoStore((s) => s.sensorMode)
  const workMode = useFixedWingDemoStore((s) => s.workMode)
  const laserOn = useFixedWingDemoStore((s) => s.laserOn)
  const laserState = useFixedWingDemoStore((s) => s.laserState)

  return (
    <div className="size-full relative bg-black">
      {/* 左上角信息（与无人机驾驶舱视频页布局一致） */}
      <aside className="absolute top-3 left-3 flex gap-2 items-center z-10">
        <span className="h-7 px-3 text-xs rounded-sm bg-ground-3/80 text-fore flex items-center gap-1.5">
          传感器
          <strong className="text-hightlight">
            {sensorMode === 'tv' ? '电视' : '红外'}
          </strong>
        </span>
        <span className="h-7 px-3 text-xs rounded-sm bg-ground-3/80 text-fore flex items-center gap-1.5">
          红外电源
          <strong className="text-hightlight">
            {laserOn ? '上电' : '下电'}
          </strong>
        </span>
        <span className="h-7 px-3 text-xs rounded-sm bg-ground-3/80 text-fore flex items-center gap-1.5">
          模式
          <strong className="text-hightlight">{workMode}</strong>
        </span>
        <span className="h-7 px-3 text-xs rounded-sm bg-ground-3/80 text-fore flex items-center gap-1.5">
          激光
          <span
            className={clsx(
              'size-2 rounded-full',
              laserOn ? 'bg-green-500' : 'bg-ground-2',
            )}
          />
          <strong className="text-hightlight">
            {laserOn ? laserState : '未上电'}
          </strong>
        </span>
      </aside>
      {/* 视频占位 (设备已离线) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center gap-1.5 text-red-500 text-sm">
          <DisconnectOutlined />
          设备已离线
        </span>
      </div>
    </div>
  )
})

FixedWingVideo.displayName = 'FixedWingVideo'

export default FixedWingVideo
