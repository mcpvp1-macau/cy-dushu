import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import XCard from '@/components/ui/XCard'
import { DeviceEnum } from '@/enum/device'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

/** 航线接力设置 */
const RelayDeviceConfig: FC<PropsType> = memo(() => {
  const allDevices = useMapDevicesStore((s) => s.allDevices)

  const relayDeviceId =
    useAirlineConfigStore((s) => s.airlineConfig.relayDeviceId) || undefined

  const deviceOptions = useMemo(
    () =>
      allDevices
        .filter((e) => e.deviceType === DeviceEnum.UAV)
        .map((e) => ({
          value: e.deviceId,
          label: (
            <div className="flex gap-2">
              <DeviceIcon type={e.deviceType} />
              {e.deviceName}
            </div>
          ),
          name: e.deviceName,
        })),

    [allDevices],
  )

  return (
    <XCard title="接力设置">
      <Select
        className="w-full mt-2"
        placeholder="请选择接力设备"
        options={deviceOptions}
        showSearch={true}
        optionFilterProp="name"
        allowClear
        value={relayDeviceId}
        onChange={(value) => {
          if (!value) {
            useAirlineConfigStore.getState().updateAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              relayDeviceId: undefined,
            })
          } else {
            useAirlineConfigStore.getState().updateAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              relayDeviceId: value,
            })
          }
        }}
      />
    </XCard>
  )
})

RelayDeviceConfig.displayName = 'RelauDeviceConfig'

export default RelayDeviceConfig
