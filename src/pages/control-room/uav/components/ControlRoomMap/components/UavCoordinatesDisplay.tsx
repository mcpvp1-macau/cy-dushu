import { CopyOutlined } from '@ant-design/icons'
import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import { useAppMsg } from '@/hooks/useAppMsg'
import LiqunTippy from '@/components/ui/LiqunTippy'

type PropsType = unknown

/** 无人机坐标显示组件 - 显示无人机的经纬度、相对高度和海拔 */
const UavCoordinatesDisplay: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  // 获取无人机坐标数据
  const { longitude, latitude, height, altitude } = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude,
      latitude: s.state.latitude,
      height: s.state.height,
      altitude: s.state.altitude,
    })),
  )

  /** 复制坐标到剪贴板 */
  const handleCopy = useMemoizedFn(async () => {
    const coordText = [
      `${t('uav.coordinates.longitude', { defaultValue: '经度' })}: ${longitude?.toFixed(6) ?? '-'}`,
      `${t('uav.coordinates.latitude', { defaultValue: '纬度' })}: ${latitude?.toFixed(6) ?? '-'}`,
      `${t('uav.coordinates.relativeHeight', { defaultValue: '相对高度' })}: ${height?.toFixed(1) ?? '-'} m`,
      `${t('uav.coordinates.altitude', { defaultValue: '海拔' })}: ${altitude?.toFixed(1) ?? '-'} m`,
    ].join(', ')

    await navigator.clipboard.writeText(coordText)
    msgApi.success(
      t('uav.coordinates.copySuccess', { defaultValue: '坐标已复制到剪切板' }),
    )
  })

  return (
    <div className="flex items-center gap-2 text-fore text-xs">
      <DeviceIconUAV2 className="text-sm" />

      <LiqunTippy
        content={t('uav.coordinates.tooltip', {
          defaultValue: '无人机当前坐标 (经度, 纬度, 相对高度, 海拔)',
        })}
        placement="top"
      >
        <span className="whitespace-nowrap">
          {longitude?.toFixed(6) ?? '-'}, {latitude?.toFixed(6) ?? '-'},{' '}
          {height?.toFixed(1) ?? '-'} m, {altitude?.toFixed(1) ?? '-'} m
        </span>
      </LiqunTippy>

      <LiqunTippy
        content={t('uav.coordinates.copy', { defaultValue: '复制坐标' })}
        placement="top"
      >
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-primary cursor-pointer transition-colors"
        >
          <CopyOutlined />
        </button>
      </LiqunTippy>
    </div>
  )
})

UavCoordinatesDisplay.displayName = 'UavCoordinatesDisplay'

export default UavCoordinatesDisplay
