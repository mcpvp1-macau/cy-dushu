import styles from './style.module.less'
import { dft } from '@/constant/time-fmt'
import { Button } from 'antd'
import IconPlay from '@/assets/icons/jsx/IconPlay'
import IconSpeedFaster from '@/assets/icons/jsx/IconSpeedFaster'
import IconSpeedSlower from '@/assets/icons/jsx/IconSpeedSlower'
import { useControllableValue, useRafInterval, useThrottleFn } from 'ahooks'
import TimelineContext from './hooks/context'
import { UndoOutlined } from '@ant-design/icons'
import IconPause from '@/assets/icons/jsx/IconPause'
import useTimelineInstance from './hooks/useTimelineInstance'
import { DayjsInstance, fmtCurrentTime } from './utils/fmt'
import DateRangePicker from '../AntdOverride/DateRangePicker'

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

const timeRangeGroupId = 'time-range-group'

/** 时间轴 */
const Timeline: FC<PropsType> = memo(
  ({ children, onTimeChanged, ...props }) => {
    const timelineContainerRef = useRef<HTMLDivElement>(null)

    // 时间范围
    const [timeRange, setTimeRange] = useControllableValue(props, {
      defaultValue: [
        dayjs().subtract(1, 'days').startOf('day'),
        dayjs().endOf('day'),
      ] as [DayjsInstance, DayjsInstance],
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

    const { timeline, dataset, groupSets } = useTimelineInstance(
      timelineContainerRef,
      timeRange,
    )

    useEffect(() => {
      if (!dataset) {
        return
      }

      dataset.update([
        {
          id: 'time-range',
          type: 'background',
          group: timeRangeGroupId,
          className: 'time-range',
          content: '',
        },
        {
          id: 'time-range-visited',
          type: 'background',
          group: timeRangeGroupId,
          className: 'time-range-visited',
          content: '',
        },
      ])
    }, [dataset])

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
      try {
        timeline.setCustomTime(currentTime.toDate(), 'current')
        timeline.setCustomTimeMarker(fmtCurrentTime(currentTime), 'current')
      } catch (error) {
        console.error('timeline set custom time error', error)
      }
    }, [currentTime, timeline])

    useEffect(() => {
      if (!timeline || !dataset) {
        return
      }
      try {
        dataset.update({
          id: 'time-range-visited',
          type: 'background',
          start: timeRange[0].toDate(),
          end: currentTime.toDate(),
          content: '',
          group: timeRangeGroupId,
          className: 'time-range-visited',
        })
      } catch (error) {
        console.error('timeline set items error', error)
      }
    }, [currentTime, dataset, timeline, timeRange[0]])

    // 播放倍数
    const [multiple, setMultiple] = useControllableValue(props, {
      defaultValue: 1,
      valuePropName: 'multiple',
      trigger: 'onMultipleChange',
    })

    const [isDraggingTime, setIsDraggingTime] = useState(false)

    const { run: handleTimeChange } = useThrottleFn(
      (e) => {
        try {
          timeline?.setCustomTimeMarker(fmtCurrentTime(e.time), 'current')
          setCurrentTime(dayjs(e.time))
          setIsDraggingTime(true)
        } catch (error) {
          console.error('timeline set custom time marker error', error)
        }
      },
      { wait: 100, trailing: false },
    )

    // 播放
    useRafInterval(
      () => {
        if (!timeline) {
          return
        }
        setCurrentTime((prev) => {
          if (prev.add(1, 'second').isAfter(timeRange[1])) {
            return timeRange[0]
          }
          return prev.add(1, 'second')
        })
      },
      playing && !isDraggingTime ? 1000 / multiple : undefined,
    )

    return (
      <div className={styles['liqun-timebar']}>
        <div className="p-1 flex justify-between">
          {/* left */}
          <div className="flex-1">
            <DateRangePicker
              value={timeRange}
              size="small"
              className="border border-solid border-ground-5"
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  return
                }
                setTimeRange([dates[0].startOf('day'), dates[1].endOf('day')])
                if (!timeline || !dataset) {
                  return
                }

                try {
                  timeline.setWindow(
                    dates[0].startOf('day').toDate(),
                    dates[1].endOf('day').toDate(),
                  )
                  timeline.setCustomTime(
                    dates[0].startOf('day').toDate(),
                    'current',
                  )
                  timeline.setCustomTimeMarker(
                    dayjs(dates[0].startOf('day')).format(dft),
                    'current',
                  )
                  dataset.update([
                    {
                      type: 'background',
                      start: dates[0].toDate(),
                      end: dates[1].toDate(),
                      id: 'time-range',
                      content: '',
                      group: timeRangeGroupId,
                      className: 'time-range',
                      // selectable: false,
                      // editable: false,
                    },
                  ])
                } catch (error) {
                  console.error('timeline set custom time error', error)
                }

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
        <div className="h-[1px] w-full bg-ground-5" />
        <TimelineContext.Provider
          value={{
            timeline: timeline,
            dataSets: dataset,
            groupSets,
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
