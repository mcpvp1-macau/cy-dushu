import styles from './style.module.less'
import { dft } from '@/constant/time-fmt'
import { Button, DatePicker } from 'antd'
import IconPlay from '@/assets/icons/jsx/IconPlay'
import IconSpeedFaster from '@/assets/icons/jsx/IconSpeedFaster'
import IconSpeedSlower from '@/assets/icons/jsx/IconSpeedSlower'
import { useControllableValue, useRafInterval, useThrottleFn } from 'ahooks'
import TimelineContext from './hooks/context'
import { UndoOutlined } from '@ant-design/icons'
import IconPause from '@/assets/icons/jsx/IconPause'
import useTimelineInstance from './hooks/useTimelineInstance'
import { DayjsInstance, fmtCurrentTime } from './utils/fmt'

type PropsType = {
  time?: DayjsInstance
  defaultTime?: DayjsInstance
  onTimeChange?: (time: DayjsInstance) => void
  onTimeChanged?: (time: DayjsInstance) => void
} & {
  multiple?: number
  defaultMultiple?: number
  onMultipleChange?: (multiple: number) => void
} & {
  playing?: boolean
  defaultPlaying?: boolean
  onPlayingChange?: (playing: boolean) => void
} & {
  timeRange?: [DayjsInstance, DayjsInstance]
  defaultTimeRange?: [DayjsInstance, DayjsInstance]
  onTimeRangeChange?: (range: [DayjsInstance, DayjsInstance]) => void
} & {
  children?: React.ReactNode
}

/** 时间轴 */
const Timeline: FC<PropsType> = memo(
  ({ children, onTimeChanged, ...props }) => {
    const timelineContainerRef = useRef<HTMLDivElement>(null)

    // 时间范围
    const [timeRange, setTimeRange] = useControllableValue(props, {
      defaultValue: [dayjs().subtract(1, 'days'), dayjs()] as [
        DayjsInstance,
        DayjsInstance,
      ],
      defaultValuePropName: 'defaultTimeRange',
      valuePropName: 'timeRange',
      trigger: 'onTimeRangeChange',
    })

    // 当前时间
    const [currentTime, setCurrentTime] = useControllableValue(props, {
      defaultValue: timeRange[0],
      valuePropName: 'time',
      defaultValuePropName: 'defaultTime',
      trigger: 'onTimeChange',
    })

    // 是否正在播放
    const [playing, setPlaying] = useControllableValue(props, {
      defaultValue: false,
      valuePropName: 'playing',
      defaultValuePropName: 'defaultPlaying',
      trigger: 'onPlayingChange',
    })

    const { timeline, dataset } = useTimelineInstance(
      timelineContainerRef,
      timeRange,
    )

    useEffect(() => {
      if (!timeline) {
        return
      }
      timeline.on('timechanged', (e) => {
        setIsDraggingTime(false)
        const dayjsTime = dayjs(e.time)
        setCurrentTime(dayjsTime)
        onTimeChanged?.(dayjsTime)
      })

      timeline.on('timechange', handleTimeChange)
    }, [timeline])

    useEffect(() => {
      if (!timeline) {
        return
      }
      timeline.setCustomTime(currentTime.toDate(), 'current')
      timeline.setCustomTimeMarker(fmtCurrentTime(currentTime), 'current')
    }, [currentTime, timeline])

    // 播放倍数
    const [multiple, setMultiple] = useControllableValue(props, {
      defaultValue: 1,
      valuePropName: 'multiple',
      trigger: 'onMultipleChange',
    })

    const [isDraggingTime, setIsDraggingTime] = useState(false)

    const { run: handleTimeChange } = useThrottleFn(
      (e) => {
        timeline?.setCustomTimeMarker(fmtCurrentTime(e.time), 'current')
        setCurrentTime(dayjs(e.time))
        setIsDraggingTime(true)
      },
      { wait: 100, trailing: false },
    )

    // 播放
    useRafInterval(
      () => {
        if (!timeline) {
          return
        }
        setCurrentTime((prev) => prev.add(1, 'second'))
      },
      playing && !isDraggingTime ? 1000 / multiple : undefined,
    )

    return (
      <div className={styles['liqun-timebar']}>
        <div className="p-1 flex justify-between">
          {/* left */}
          <div className="flex-1">
            <DatePicker.RangePicker
              value={timeRange}
              size="small"
              className="border border-solid border-ground-300"
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  return
                }
                setTimeRange([dates[0], dates[1]])
                if (!timeline) {
                  return
                }
                timeline.setWindow(
                  dates[0].toDate(),
                  dates[1].endOf('day').toDate(),
                )
                timeline.setCustomTime(dates[0].toDate(), 'current')
                timeline.setCustomTimeMarker(
                  dayjs(dates[0]).format(dft),
                  'current',
                )
                timeline.setItems([
                  {
                    type: 'background',
                    start: dates[0].toDate(),
                    end: dates[1].endOf('day').toDate(),
                    className: 'time-range',
                    id: 'time-range',
                    content: '',
                  },
                ])
                setCurrentTime(dates[0])
              }}
            />
          </div>

          {/* mid */}
          <div className="flex-1 flex gap-1 justify-center">
            <Button
              size="small"
              icon={<IconSpeedSlower />}
              onClick={() => setMultiple(Math.max(1 / 8, multiple / 2))}
            />
            <Button
              size="small"
              icon={
                playing ? (
                  <IconPause className="scale-90" />
                ) : (
                  <IconPlay className="scale-90" />
                )
              }
              onClick={() => setPlaying((prev) => !prev)}
            >
              {multiple} x
            </Button>
            <Button
              size="small"
              icon={<IconSpeedFaster />}
              onClick={() => setMultiple(Math.min(8, multiple * 2))}
            />
          </div>

          {/* right */}
          <div className="flex-1 flex justify-end">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => {
                timeline?.moveTo(currentTime.toDate())
              }}
            />
          </div>
        </div>
        <div className="h-[1px] w-full bg-ground-300" />
        <TimelineContext.Provider
          value={{
            timeline: timeline,
            dataSets: dataset,
          }}
        >
          <div className="timeline" ref={timelineContainerRef}>
            {children}
          </div>
        </TimelineContext.Provider>
      </div>
    )
  },
)

Timeline.displayName = 'Timeline'

export default Timeline
