import { getDeviceStreamList } from '@/service/modules/device/device-video'
import { calcStreamId } from '@/utils/video/stream'
import { Select } from 'antd'

type PropsType = {
  currentUrl: string
  deviceId: string
  streamList: Awaited<ReturnType<typeof getDeviceStreamList>>['data']
  onChange?: (value: string) => void
}

/** 视频流切换 */
const VideoStream: FC<PropsType> = memo(
  ({ currentUrl, streamList, deviceId, onChange }) => {
    const currentStreamId = useMemo(
      () => calcStreamId(currentUrl),
      [currentUrl],
    )

    const options = useMemo(
      () =>
        streamList?.map((e: any) => ({
          label: e.appName,
          value: e.playUrl,
        })) ?? [],
      [streamList],
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
        variant="borderless"
        value={selectValue}
        suffixIcon={null}
        options={options}
        onChange={(v) => {
          sessionStorage.setItem(deviceId + '-videoURL', v)
          onChange?.(v)
        }}
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
