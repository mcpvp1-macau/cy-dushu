import IconButton from '@/components/ui/button/IconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Dropdown } from 'antd'
import { memo, type FC } from 'react'

type PropsType = {
  postSerivce: ReturnType<typeof usePostDeviceService>
}

const modeMap = {
  0: 'MF',
  1: 'AFS',
  2: 'AFC',
}

const modeZhMap = {
  0: '手动',
  1: '单点',
  2: '自动',
}

/** 镜头变焦模式 */
const ZoomFocusMode: FC<PropsType> = memo(({ postSerivce }) => {
  const zoomFocusMode =
    useUavControlRoomStore((s) => s.state.zoomFocusMode) ?? 0

  const lensType = useUavControlRoomStore((s) => s.state.lensType)
  const handleClick = ({ key }: { key: string }) => {
    postSerivce('changeZoomFocusMode', {
      mode: Number(key),
      lens: lensType,
    })
  }

  return (
    <Dropdown
      menu={{
        items: Object.entries(modeMap).map(([k, v]) => ({
          key: k,
          value: k,
          label: (
            <p className="flex flex-col items-center text-xs">
              <span>{v}</span>
              <span>{modeZhMap[k]}</span>
            </p>
          ),
          onClick: handleClick,
        })),
        activeKey: zoomFocusMode,
        selectedKeys: [zoomFocusMode],
      }}
      disabled={!(lensType === 'wide' || lensType === 'zoom')}
    >
      <IconButton className="border border-solid border-ground-300 bg-ground-200 rounded-sm text-xs w-[25px] h-[25px]">
        {modeMap[zoomFocusMode]}
      </IconButton>
    </Dropdown>
  )
})

ZoomFocusMode.displayName = 'ZoomFocusMode'

export default ZoomFocusMode
