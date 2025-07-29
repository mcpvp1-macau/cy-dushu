import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import { ColorPicker, Switch, Tooltip } from 'antd'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import Select from '@/components/AntdOverride/Select'
import { InfoCircleOutlined } from '@ant-design/icons'
import useDeviceInactiveStore from '@/store/setting/useDeviceInactiveSetting.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

/** 无人机设备配置 */
const UavConfiguration: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )
  const openInactiveTrack = useDeviceInactiveStore((s) => s.trackOpen[deviceId])

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p>{t('device.trackColor')}</p>
        <ColorPicker
          size="small"
          disabledAlpha
          disabledFormat
          value={color}
          onChangeComplete={(value) => {
            useDeviceTrackColorStore
              .getState()
              .setColor(deviceId, value.toHexString())
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <p>{t('device.trackMaterial.title')}</p>
        <Select
          size="small"
          value={materialType}
          options={[
            { label: t('device.trackMaterial.options.color'), value: 'color' },
            {
              label: t('device.trackMaterial.options.outline'),
              value: 'outline',
            },
            { label: t('device.trackMaterial.options.glow'), value: 'glow' },
          ]}
          onChange={(value) => {
            useDeviceTrackColorStore
              .getState()
              .setMaterialType(deviceId, value as 'color' | 'outline' | 'glow')
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          惰性轨迹
          <Tooltip title="在设备详情非激活状态下，实时轨迹仍保留。以打开应用或打开开关的时间后到者为准。注意：改轨迹更新较缓，且不与详情实时轨迹同步。">
            <InfoCircleOutlined />
          </Tooltip>
        </div>
        <Switch
          size="small"
          checked={openInactiveTrack}
          onChange={(e) => {
            useDeviceInactiveStore.getState().setTrackOpen(deviceId, e)
            if (!e) {
              const oldTracks = {
                ...useMapDevicesStore.getState().deviceInActiveTracks,
              }
              if (oldTracks[deviceId]) {
                delete oldTracks[deviceId]
              }
              useMapDevicesStore
                .getState()
                .updateDeviceInActiveTracks(oldTracks)
            }
          }}
        />
      </div>
    </div>
  )
})

UavConfiguration.displayName = 'UavConfiguration'

export default UavConfiguration
