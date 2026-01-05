import { Button } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { setDeviceProp } from '@/service/modules/device'
import useUserStore from '@/store/useUser.store'
import {
  useSmartCarGimbalControlRoomStore,
} from '@/store/context-store/useSmartCarGimbalControlRoom.store'
import { AimOutlined } from '@ant-design/icons'

type PropsType = {
  gimbalDevice?: API_DEVICE.domain.Device | null
}

const SmartCarGimbalControlPanel: FC<PropsType> = memo(({ gimbalDevice }) => {
  const { t } = useTranslation()

  const user = useUserStore((s) => s.user)

  const updateUUID = useSmartCarGimbalControlRoomStore((s) => s.updateUUID)
  const operator = useSmartCarGimbalControlRoomStore((s) => s.state?.operator)
  const hasControlPower = useSmartCarGimbalControlRoomStore(
    (s) => s.hasControlPower,
  )

  const productKey =
    gimbalDevice?.productKey ?? gimbalDevice?.deviceModel?.productKey ?? ''
  const deviceId = gimbalDevice?.deviceId ?? ''

  const hasControlTag = useMemo(() => {
    return (
      gimbalDevice?.deviceModel?.properties?.some(
        (item) => item?.identifier === 'controlTag',
      ) ?? false
    )
  }, [gimbalDevice?.deviceModel?.properties])

  const canOperate = !!(productKey && deviceId && hasControlTag)

  const { mutate: robControlPower, isPending } = useMutation({
    mutationFn: (uuid: string) =>
      setDeviceProp(
        productKey,
        deviceId,
        {
          controlTag: uuid,
          operator: user?.username,
          name: user?.name ?? '',
          groupName: user?.groupName ?? user?.groupId ?? '',
        },
        { msgPrefix: t('controlRoom.service.robControlPowerError.msg') },
      ),
    onSuccess: ({ data }, uuid) => {
      if (uuid === 'ANY') {
        updateUUID('')
        return
      }
      if (data?.controlTag?.result === '0') {
        updateUUID(uuid)
      } else {
        updateUUID('')
      }
    },
    onError: () => {
      updateUUID('')
    },
  })

  const handleClick = useMemoizedFn(() => {
    if (!canOperate) {
      return
    }
    // 业务规则：已占有时点击释放控制权，未占有时抢占控制权。
    if (hasControlPower) {
      robControlPower('ANY')
      return
    }

    robControlPower(uuidv4())
  })

  if (!gimbalDevice?.deviceId) {
    return (
      <div className="text-sm text-fore-2">
        {t('controlRoom.smartCar.noGimbal', {
          defaultValue: '暂无云台设备',
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-fore">
          {t('controlRoom.smartCar.gimbalPanel', {
            defaultValue: '云台操作',
          })}
        </span>
        <span className="text-xs text-fore-2">
          {gimbalDevice?.name || gimbalDevice?.deviceName || deviceId}
        </span>
      </div>
      <Button
        icon={<AimOutlined />}
        loading={isPending}
        disabled={!canOperate}
        type={hasControlPower ? 'primary' : 'default'}
        onClick={handleClick}
      >
        {t('device.controlPower.title')}
        {operator ? ` (${operator})` : ''}
      </Button>
    </div>
  )
})

SmartCarGimbalControlPanel.displayName = 'SmartCarGimbalControlPanel'

export default SmartCarGimbalControlPanel
