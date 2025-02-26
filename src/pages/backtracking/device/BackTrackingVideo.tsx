import { getHistoryVideo } from '@/service/modules/device'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import VideoPlayerBackTracking from '@/components/VideoS/VideoPlayerBackTracking'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { dft } from '@/constant/time-fmt'
import AppEmpty from '@/components/AppEmpty'

type PropsType = {
  deviceId: string
  productKey: string
  videoId: string | undefined
}

const BackTrackingVideo: React.FC<PropsType> = ({
  productKey,
  deviceId,
  videoId,
}) => {
  const queryClient = useQueryClient()

  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const dataTime = useBackTrackingStore((s) => s.currentTime)
  const playing = useBackTrackingStore((s) => s.playing)

  const startTime = dayjs(timeRange[0])!.format(dft)
  const endTime = dayjs(timeRange[1])!.format(dft)

  const { data: videoList } = useQuery(
    {
      queryKey: ['getHistoryVideo', deviceId, startTime, endTime],
      queryFn: () =>
        getHistoryVideo(productKey, deviceId, videoId!, {
          startTime,
          endTime,
        }),
      enabled: !!videoId && !!timeRange,
      select: (d) => d.data.videoList,
    },
    queryClient,
  )

  const { url, time } = useMemo(() => {
    if (videoList) {
      const item = videoList.find(
        (item) =>
          dayjs(item.timeRange[0]).isBefore(dayjs(dataTime)) &&
          dayjs(item.timeRange[1]).isAfter(dayjs(dataTime)),
      )
      return {
        url: item?.playUrl || '',
        time: dayjs(dataTime).diff(dayjs(item?.timeRange[0]), 'second'),
      }
    }
    return { url: '', time: 0 }
  }, [videoList, dataTime])

  if (!url)
    return (
      <div className="text-center aspect-video bg-black m-[12px] pt-[30px]">
        <AppEmpty description="当前时段暂无视频" />
      </div>
    )

  return <VideoPlayerBackTracking src={url} playing={playing} time={time} />
}

export default BackTrackingVideo
