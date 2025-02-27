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
      max: new Date(2070, 0),
      min: new Date(1970, 0),
      start: startTime,
      end: endTime,
    })

    timeline.addCustomTime(startTime, 'current')
    timeline.setCustomTimeTitle('', 'current')
    timeline.setCustomTimeMarker(fmtCurrentTime(startTime), 'current')

    setTimeline(timeline)

    return () => {
      timeline.destroy()
    }
  }, [containerRef, timeRange])

  return {
    timeline,
    dataset,
  }
}

export default useTimelineInstance
