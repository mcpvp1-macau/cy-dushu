import PositionPickListener from '@/components/map/PositionPickListener'
import usePositionPickerStore from '@/store/map/usePositionPicker.store'

type PropsType = unknown

/** 全局地图选点监听器 - 响应来自其他组件的选点请求 */
const GlobalPositionPicker: FC<PropsType> = memo(() => {
  const isPicking = usePositionPickerStore((s) => s.isPicking)
  const setPosition = usePositionPickerStore((s) => s.setPosition)

  const handleClick = (longitude: number, latitude: number) => {
    setPosition(longitude, latitude)
  }

  if (!isPicking) {
    return null
  }

  return <PositionPickListener onClick={handleClick} />
})

GlobalPositionPicker.displayName = 'GlobalPositionPicker'

export default GlobalPositionPicker
