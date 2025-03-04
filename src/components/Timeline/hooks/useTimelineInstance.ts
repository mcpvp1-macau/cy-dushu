import * as vis from 'vis-timeline/standalone'
import { DayjsInstance, fmtCurrentTime } from '../utils/fmt'

const useTimelineInstance = (
  containerRef: React.RefObject<HTMLElement>,
  timeRange: [DayjsInstance, DayjsInstance],
) => {
  const [timeline, setTimeline] = useState<vis.Timeline | null>(null)
  const [dataset, setDataset] = useState<InstanceType<
    typeof vis.DataSet<any>
  > | null>(null)

  const perStartTime = useRef(0)
  const perEndTime = useRef(0)
  // 创建时间轴
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const startTime = timeRange[0].toDate()
    const endTime = timeRange[1].toDate()

    const dataset = new vis.DataSet([
      {
        id: 'time-range',
        type: 'background',
        start: startTime,
        end: endTime,
        className: 'time-range',
        content: '',
      },
      {
        id: 'time-range2',
        type: 'background',
        start: startTime,
        end: endTime,
        className: 'time-range2',
        content: '',
      },
    ])

    setDataset(dataset)

    const timeline = new vis.Timeline(containerRef.current, dataset, {
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
      max: dayjs(endTime).add(1, 'minutes').toDate(),
      min: startTime,
      start: startTime,
      end: endTime,
    })

    perStartTime.current = startTime.getTime()
    perEndTime.current = endTime.getTime()

    timeline.addCustomTime(startTime, 'current')
    timeline.setCustomTimeTitle('', 'current')
    timeline.setCustomTimeMarker(fmtCurrentTime(startTime), 'current')

    setTimeline(timeline)

    return () => {
      if (containerRef.current) {
        timeline.destroy()
      }
    }
  }, [containerRef])

  useEffect(() => {
    if (!timeline) {
      return
    }

    const startTime = timeRange[0].toDate()
    const endTime = timeRange[1].toDate()
    if (
      perStartTime.current !== startTime.getTime() ||
      perEndTime.current !== endTime.getTime()
    ) {
      perStartTime.current = startTime.getTime()
      perEndTime.current = endTime.getTime()
      timeline.setOptions({
        max: dayjs(endTime).add(1, 'minutes').toDate(),
        min: startTime,
        start: startTime,
        end: endTime,
      })
    }
  }, [timeline, timeRange])

  return {
    timeline,
    dataset,
  }
}

export default useTimelineInstance
