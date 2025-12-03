import { addDeviceTag, updateDeviceTag } from '@/service/modules/device-dushu'
import { useAppMsg } from '@/hooks/useAppMsg'
import { Switch } from 'antd'

const MAINTENANCE_STATUS_TAG = 'MAINTENANCE_STATUS'

type DeviceTag = {
  tagName: string
  tagValue?: string
}

type MaintenanceStatusSwitchProps = {
  deviceId: string
  productKey: string
  deviceTags?: DeviceTag[]
}

const MaintenanceStatusSwitch: FC<MaintenanceStatusSwitchProps> = memo(
  ({ deviceId, productKey, deviceTags }) => {
    const msgApi = useAppMsg()
    const [maintenanceStatus, setMaintenanceStatus] = useState('运行中')
    const [hasMaintenanceStatusTag, setHasMaintenanceStatusTag] = useState(false)
    const [maintenanceStatusLoading, setMaintenanceStatusLoading] =
      useState(false)

    const maintenanceStatusTagValue = useMemo(
      () =>
        deviceTags?.find((item) => item.tagName === MAINTENANCE_STATUS_TAG)
          ?.tagValue,
      [deviceTags],
    )

    useEffect(() => {
      setMaintenanceStatus(maintenanceStatusTagValue ?? '运行中')
      setHasMaintenanceStatusTag(Boolean(maintenanceStatusTagValue))
    }, [maintenanceStatusTagValue])

    const handleMaintenanceStatusChange = useMemoizedFn(
      async (checked: boolean) => {
        const targetValue = checked ? '维修中' : '运行中'
        setMaintenanceStatusLoading(true)
        try {
          const payload = {
            deviceId,
            productKey,
            key: MAINTENANCE_STATUS_TAG,
            name: '维修状态',
            value: targetValue,
          }
          if (hasMaintenanceStatusTag) {
            await updateDeviceTag(payload)
          } else {
            await addDeviceTag(payload)
            setHasMaintenanceStatusTag(true)
          }
          setMaintenanceStatus(targetValue)
          msgApi.success('维修状态更新成功')
        } catch (error) {
          msgApi.error('维修状态更新失败')
          throw error
        } finally {
          setMaintenanceStatusLoading(false)
        }
      },
    )

    return (
      <div className="flex items-center gap-2">
        维修状态
        <Switch
          size="small"
          checked={maintenanceStatus === '维修中'}
          loading={maintenanceStatusLoading}
          checkedChildren="维修中"
          unCheckedChildren="运行中"
          onChange={handleMaintenanceStatusChange}
        />
      </div>
    )
  },
)

MaintenanceStatusSwitch.displayName = 'MaintenanceStatusSwitch'

export default MaintenanceStatusSwitch
