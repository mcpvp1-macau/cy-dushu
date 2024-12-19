import IconButton from '@/components/ui/button/IconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Dropdown } from 'antd'
import { borderedBtnClassName } from '..'
import { isNil } from 'lodash'
import { Mode, modeMap, modeZhMap } from './constants'

type PropsType = {
  postSerivce: ReturnType<typeof usePostDeviceService>
}

/** 镜头变焦模式 */
const ZoomFocusMode: FC<PropsType> = memo(({ postSerivce }) => {
  const zoomFocusMode: Mode = useUavControlRoomStore(
    (s) => s.state.zoomFocusMode,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)
  const handleClick = ({ key }: { key: string }) => {
    postSerivce('changeZoomFocusMode', {
      mode: String(key),
      lens: lensType,
    })
  }

  console.log(modeZhMap, zoomFocusMode)
  if (isNil(zoomFocusMode)) {
    return null
  }

  return (
    <Dropdown
      menu={{
        items: Array.from(modeMap.entries()).map(([k, v]) => ({
          key: k,
          value: k,
          label: (
            <div className="flex flex-col items-center text-xs">
              <p>{v}</p>
              <p>{modeZhMap.get(k)}</p>
            </div>
          ),
          onClick: handleClick,
        })),
      }}
      disabled={!(lensType === 'wide' || lensType === 'zoom')}
    >
      <IconButton className={clsx(borderedBtnClassName, 'text-xs')}>
        {modeMap.get(zoomFocusMode)}
      </IconButton>
    </Dropdown>
  )
})

ZoomFocusMode.displayName = 'ZoomFocusMode'

export default ZoomFocusMode
