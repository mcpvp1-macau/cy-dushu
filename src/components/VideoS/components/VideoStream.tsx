import { getDeviceStreamList } from '@/service/modules/device/device-video'
import { calcStreamId } from '@/utils/video/stream'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Select } from 'antd'

type PropsType = {
  // url: string;
  currentUrl: string
  productKey: string
  deviceId: string
  onChange?: (value: string) => void
}

const VideoStream: FC<PropsType> = memo(
  ({ currentUrl, productKey, deviceId, onChange }) => {
    const streamId =
      productKey && deviceId ? `${productKey}/${deviceId}` : undefined
    const currentStreamId = useMemo(
      () => calcStreamId(currentUrl),
      [currentUrl],
    )

    const queryClient = useQueryClient()
    const { data, isLoading } = useQuery(
      {
        queryKey: ['getDeviceStreamList', streamId],
        queryFn: async () => {
          return await getDeviceStreamList({
            streamId: streamId!,
          })
        },
        enabled: !!streamId,
        select: (d) => d.data,
      },
      queryClient,
    )

    const options = useMemo(
      () =>
        data?.map((e: any) => ({
          label: e.appName,
          value: e.playUrl,
        })) ?? [],
      [data],
    )

    const selectValue = useMemo(() => {
      return options?.find(
        (e: any) => calcStreamId(e.value) === currentStreamId,
      )?.value
    }, [currentStreamId, options])

    if (!Array.isArray(options) || options.length === 0) {
      return null
    }

    return (
      <Select
        className="w-fit text-right"
        placement="topLeft"
        popupMatchSelectWidth={false}
        loading={isLoading}
        variant="borderless"
        value={selectValue}
        suffixIcon={null}
        options={options}
        onChange={onChange}
        getPopupContainer={() =>
          (document.fullscreenElement as HTMLElement) || document.body
        }
        labelRender={(v) => (
          <div className="text-fore text-xs max-w-[70px] truncate">
            {v.label}
          </div>
        )}
      />
    )
  },
)

VideoStream.displayName = 'VideoAIStream'

export default VideoStream
