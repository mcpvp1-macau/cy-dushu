import { useFullscreen } from 'ahooks'
import { memo, type FC } from 'react'
import IconButton from '../ui/button/IconButton'
import { FullscreenExitOutlined } from '@ant-design/icons'
import { BasicTarget } from 'ahooks/lib/utils/domTarget'
import IconFull from '@/assets/icons/jsx/IconFull'

type PropsType = {
  target: BasicTarget
}

const Fullscreen: FC<PropsType> = memo(({ target }) => {
  const [isFullScreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(target)

  const { t } = useTranslation()

  if (isFullScreen) {
    return (
      <IconButton
        toolTipProps={{ title: t('common.exit') }}
        onClick={exitFullscreen}
      >
        <FullscreenExitOutlined />
      </IconButton>
    )
  }

  return (
    <IconButton
      toolTipProps={{ title: t('common.fullScreen') }}
      onClick={enterFullscreen}
    >
      <IconFull className="scale-95" />
    </IconButton>
  )
})

Fullscreen.displayName = 'Fullscreen'

export default Fullscreen
