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

  if (isFullScreen) {
    return (
      <IconButton toolTipProps={{ title: '退出全屏' }} onClick={exitFullscreen}>
        <FullscreenExitOutlined />
      </IconButton>
    )
  }

  return (
    <IconButton toolTipProps={{ title: '全屏' }} onClick={enterFullscreen}>
      <IconFull className="scale-95" />
    </IconButton>
  )
})

Fullscreen.displayName = 'Fullscreen'

export default Fullscreen
