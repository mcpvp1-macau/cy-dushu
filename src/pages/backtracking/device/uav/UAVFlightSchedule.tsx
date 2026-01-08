import XTable from '@/components/ui/XTable'
import { dft, timeOnly } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

type PropsType = unknown

type TrackSegment = {
  trackId: string
  startTime: string
  endTime: string
  duration: string
  startTimestamp: number
  endTimestamp: number
}

const columnHelper = createColumnHelper<TrackSegment>()

const formatDuration = (durationMs: number, unitLabel: string) => {
  // 边界情况：时间差异常时兜底为 0，避免出现 NaN
  const safeDuration = Number.isFinite(durationMs) ? Math.max(durationMs, 0) : 0
  const minutes = Math.ceil(safeDuration / 60000)

  return `${minutes} ${unitLabel}`
}

const getTrackTimestamp = (point: API_DBAPI.domain.TrackPoint) => {
  const timeByNumber =
    typeof point?.acquisitionTime === 'number' &&
    Number.isFinite(point.acquisitionTime)
      ? point.acquisitionTime
      : null

  if (timeByNumber !== null) {
    return timeByNumber
  }

  if (!point?.acquisitionTimeFormat) {
    return null
  }

  const timeByFormat = dayjs(point.acquisitionTimeFormat)
  if (!timeByFormat.isValid()) {
    return null
  }

  return timeByFormat.valueOf()
}

/** 无人机飞行架次信息 */
const UAVFlightSchedule: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const deviceId = useBackTrackingStore((s) => s.detail?.deviceId)
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const selectedTrackId = useBackTrackingStore((s) => s.selectedTrackId)
  const updateSelectedTrackId = useBackTrackingStore(
    (s) => s.updateSelectedTrackId,
  )
  const updateCurrentTime = useBackTrackingStore((s) => s.updateCurrentTime)

  const startTime = timeRange?.[0]?.format?.(dft)
  const endTime = timeRange?.[1]?.format?.(dft)

  const {
    data: tracks,
    isLoading,
    isRefetching,
  } = useQuery(
    {
      queryKey: ['trackQuery', { deviceId, startTime, endTime }],
      queryFn: () =>
        getTrackQuery({
          deviceId: deviceId!,
          startTime: startTime!,
          endTime: endTime!,
        }),
      enabled: !!deviceId && !!startTime && !!endTime,
      select: (data) => data?.data ?? [],
    },
    queryClient,
  )

  const trackSegments = useMemo(() => {
    if (!Array.isArray(tracks) || !tracks.length) {
      return []
    }

    const segmentMap = new Map<string, TrackSegment>()

    for (const point of tracks) {
      const trackId = point?.trackId?.toString?.().trim()
      // 业务规则：没有 trackId 的点不参与飞行架次分段
      if (!trackId) {
        continue
      }

      const timestamp = getTrackTimestamp(point)
      // 边界情况：采集时间无效时跳过，避免出现无意义时间段
      if (timestamp === null) {
        continue
      }

      const cached = segmentMap.get(trackId)
      if (!cached) {
        segmentMap.set(trackId, {
          trackId,
          startTimestamp: timestamp,
          endTimestamp: timestamp,
          startTime: '',
          endTime: '',
          duration: '',
        })
        continue
      }

      cached.startTimestamp = Math.min(cached.startTimestamp, timestamp)
      cached.endTimestamp = Math.max(cached.endTimestamp, timestamp)
    }

    const durationUnit = t('backtracking.uavFlightSchedule.durationUnit', {
      defaultValue: 'mins',
    })

    return Array.from(segmentMap.values())
      .map((segment) => ({
        ...segment,
        startTime: dayjs(segment.startTimestamp).format(timeOnly),
        endTime: dayjs(segment.endTimestamp).format(timeOnly),
        duration: formatDuration(
          segment.endTimestamp - segment.startTimestamp,
          durationUnit,
        ),
      }))
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
  }, [tracks, t])

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'index',
        header: t('common.orderNo', {
          defaultValue: '序号',
        }),
        cell: (cell) => cell.row.index + 1,
      }),
      columnHelper.accessor('startTime', {
        header: t('common.startTime', {
          defaultValue: '开始时间',
        }),
      }),
      columnHelper.accessor('endTime', {
        header: t('common.endTime', {
          defaultValue: '结束时间',
        }),
      }),
      columnHelper.accessor('duration', {
        header: t('common.duration', {
          defaultValue: '时长',
        }),
      }),
    ]
  }, [t])

  const table = useReactTable({
    data: trackSegments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.trackId,
  })

  const handleSelectTrack = useMemoizedFn((track: TrackSegment) => {
    if (!track?.trackId) {
      return
    }

    updateSelectedTrackId(track.trackId)
    // 业务规则：选中架次后将时间轴定位到结束时间
    updateCurrentTime(dayjs(track.endTimestamp))
  })

  const handleResetTrack = useMemoizedFn(() => {
    // 业务规则：清空选中架次后，表示不过滤轨迹
    updateSelectedTrackId(null)
  })

  return (
    <div className="px-3 pb-3">
      <div className="border border-solid border-ground-3 rounded overflow-hidden">
        <div className="flex items-center justify-end gap-2 px-2 py-1 bg-ground-4 text-xs">
          <button
            type="button"
            className={clsx(
              'text-primary transition-opacity',
              !selectedTrackId && 'opacity-40 cursor-not-allowed',
            )}
            disabled={!selectedTrackId}
            onClick={handleResetTrack}
          >
            {t('backtracking.uavFlightSchedule.showAllTracks', {
              defaultValue: '显示全部轨迹',
            })}
          </button>
        </div>
        <div className="overflow-x-auto text-sm">
          <XTable
            table={table}
            loading={isLoading || isRefetching}
            thClassName="p-1 text-center"
            tdClassName="p-1 text-center"
            rowClassName={(row) =>
              clsx(
                'cursor-pointer',
                row.original.trackId === selectedTrackId && 'bg-primary/20',
              )
            }
            onRowClick={(row) => handleSelectTrack(row.original)}
          />
        </div>
      </div>
    </div>
  )
})

UAVFlightSchedule.displayName = 'UAVFlightSchedule'

export default UAVFlightSchedule
