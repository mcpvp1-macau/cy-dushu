import IconPositionZoom from '@/assets/icons/jsx/uav/IconPositionZoom'
import IconButton from '@/components/ui/button/IconButton'
import { GetProps, Input } from 'antd'
import useFormInstance from 'antd/es/form/hooks/useFormInstance'
import VideoAreaPickerDrawer from './VideoAreaPickerDrawer'
import { shouldJson } from '@/utils/json'

type PropsType = {
  filedName: string
  videoInfo?: GetProps<typeof VideoAreaPickerDrawer>['videoInfo']
}

const VideoAreaPicker: FC<PropsType> = memo(({ filedName, videoInfo }) => {
  const form = useFormInstance()
  const fieldValue = form.getFieldValue(filedName)
  const value = Array.isArray(shouldJson(fieldValue)) ? fieldValue : []
  const [open, { set, setTrue }] = useBoolean()

  return (
    <Input
      disabled
      value={JSON.stringify(value)}
      addonAfter={
        <>
          <IconButton
            className="w-7 h-7"
            toolTipProps={{ title: '在视频上划选区域' }}
            onClick={setTrue}
          >
            <IconPositionZoom />
          </IconButton>
          <VideoAreaPickerDrawer
            value={value}
            onChange={(v) => form.setFieldValue(filedName, shouldJson(v))}
            visible={open}
            videoInfo={videoInfo}
            setVisible={set}
          />
        </>
      }
    />
  )
})

VideoAreaPicker.displayName = 'VideoAreaPicker'

export default VideoAreaPicker
