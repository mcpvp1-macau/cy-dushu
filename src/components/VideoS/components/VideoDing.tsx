import { memo, type FC } from 'react'
import IconButton from '../../ui/button/IconButton'
import IconDing from '@/assets/icons/jsx/IconDing'
import useFixedWindowsStore from '@/store/useFixedWindows.store'

type PropsType = {
  productKey: string
  deviceId: string
  videoId: string
}

const VideoDing: FC<PropsType> = memo((props) => {
  const addWindow = useFixedWindowsStore((s) => s.addWindow)

  const { t } = useTranslation()

  return (
    <IconButton
      tippyProps={{ content: t('common.fixedOut') }}
      onClick={() => {
        addWindow({
          params: {
            type: 'live-video',
            productKey: props.productKey,
            deviceId: props.deviceId,
            videoId: props.videoId,
          },
          allowScale: true,
          layout: {
            x: document.body.clientWidth / 2 - 200,
            y: document.body.clientHeight / 2 - 150,
            width: 320 + 2,
            height: 320 * (9 / 16) + 32 + 2,
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
