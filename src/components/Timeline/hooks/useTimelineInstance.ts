import * as vis from 'vis-timeline/standalone'
import { DayjsInstance, fmtCurrentTime } from '../utils/fmt'

const useTimelineInstance = (
  containerRef: React.RefObject<HTMLElement>,
  timeRange: [DayjsInstance, DayjsInstance],
) => {
  const [timeline, setTimeline] = useState<vis.Timeline | null>(null)

  const [dataset, setDataset] = useState<vis.DataSetDataItem | null>(null)

  const [groupSets, setGroupSets] = useState<vis.DataSetDataGroup | null>(null)

  const perStartTime = useRef(0)
  const perEndTime = useRef(0)

  // 创建时间轴
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const startTime = timeRange[0].toDate()
    const endTime = timeRange[1].toDate()

    const dataset = new vis.DataSet<vis.DataItem>([
      {
        id: 'time-range',
        type: 'background',
        start: startTime,
        end: endTime,
        className: 'bg-blue-500',
        content: '',
      },
      {
        id: 'time-range-visited',
        type: 'background',
        start: startTime,
        end: endTime,
        content: '',
      },
    ])

    const groupDataSet = new vis.DataSet<vis.DataGroup>([
      {
        id: 'time-range-group',
        content: '时间范围',
        // @ts-ignore
        subgroupStack: { A0: false, __dummy__: true },
      },
    ])

    setDataset(dataset)
    setGroupSets(groupDataSet)

    try {
      const timeDiff = dayjs(endTime).diff(startTime, 'minute')
      const timeline = new vis.Timeline(
        containerRef.current,
        dataset,
        groupDataSet,
        {
          verticalScroll: true,
          showCurrentTime: false,
          snap: (date) => date,
          zoomMin: 1000 * 60,
          format: {
            minorLabels: {
              year: 'YYYY年',
              month: 'M月',
              day: 'D日',
              week: 'W',
              weekday: 'M-D',
              hour: 'H时',
              minute: 'm分',
              second: 's秒',
            },
            majorLabels: {
              year: '',
              month: 'YYYY-MM-DD',
              day: 'YYYY-MM-DD',
              week: 'YYYY-MM-DD',
              weekday: 'YYYY-MM-DD',
              hour: 'YYYY-MM-DD HH:mm:ss',
              minute: 'YYYY-MM-DD HH:mm:ss',
              second: 'YYYY-MM-DD HH:mm:ss',
            },
          },
          max: dayjs(endTime)
            .add(timeDiff * 0.1, 'minutes')
            .toDate(),
          min: dayjs(startTime)
            .subtract(timeDiff * 0.1, 'minutes')
            .toDate(),
          start: dayjs(startTime)
            .subtract(timeDiff * 0.1, 'minutes')
            .toDate(),
          end: dayjs(endTime)
            .add(timeDiff * 0.1, 'minutes')
            .toDate(),
          // groupHeightMode: 'fitItems',

          margin: {
            item: { vertical: 2 }, // 或 margin: { item: 2 }
            // axis: 0,
          },
        },
      )

      perStartTime.current = startTime.getTime()
      perEndTime.current = endTime.getTime()

      timeline.addCustomTime(startTime, 'current')
      timeline.setCustomTimeTitle('', 'current')
      timeline.setCustomTimeMarker(fmtCurrentTime(startTime), 'current')

      setTimeline(timeline)
      return () => {
        if (containerRef.current) {
          try {
            timeline.destroy()
          } catch (error) {
            console.error('timeline destroy error', error)
          }
        }
      }
    } catch (error) {
      console.error('timeline init error', error)
    }
  }, [containerRef, timeRange])

  return {
    timeline,
    dataset,
    groupSets,
  }
}

export default useTimelineInstance
