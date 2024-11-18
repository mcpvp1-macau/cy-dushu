import { memo, type FC } from 'react'
import IconButton from '../ui/button/IconButton'
import IconDing from '@/assets/icons/jsx/IconDing'
import useFixedWindowsStore from '@/store/useFixedWindows.store'

type PropsType = {
  productKey: string
  deviceId: string
  videoId: string
}

const VideoDing: FC<PropsType> = memo((props) => {
  const addWindow = useFixedWindowsStore((s) => s.addWindow)

  return (
    <IconButton
      toolTipProps={{ title: '钉出' }}
      onClick={() => {
        addWindow({
          type: 'live-video',
          productKey: props.productKey,
          deviceId: props.deviceId,
          videoId: props.videoId,
          allowScale: true,
          layout: {
            x: document.body.clientWidth / 2 - 200,
            y: document.body.clientHeight / 2 - 150,
            width: 400,
            height: 300,
          },
        })
      }}
    >
      <IconDing />
    </IconButton>
  )
})

VideoDing.displayName = 'VideoDing'

export default VideoDing
