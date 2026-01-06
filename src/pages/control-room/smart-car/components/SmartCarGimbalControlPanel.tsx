import { Button } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { setDeviceProp } from '@/service/modules/device'
import useUserStore from '@/store/useUser.store'
import { useSmartCarGimbalControlRoomStore } from '@/store/context-store/useSmartCarGimbalControlRoom.store'
import { AimOutlined } from '@ant-design/icons'
import AppEmpty from '@/components/AppEmpty'

type PropsType = {
  gimbalDevice?: API_DEVICE.domain.Device | null
}

const SmartCarGimbalOperatorPanel: FC<PropsType> = memo(({ gimbalDevice }) => {
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
      <div className="size-full flex flex-col justify-center items-center text-sm">
        <AppEmpty
          description={t('controlRoom.smartCar.noGimbal', {
            defaultValue: '暂无云台设备',
          })}
        />
      </div>
    )
  }

  return (
    <div className="size-full flex flex-col justify-center gap-3 p-3">
      <div>
        <Button
          block
          icon={<AimOutlined />}
          loading={isPending}
          disabled={!canOperate}
          type={hasControlPower ? 'primary' : 'default'}
          onClick={handleClick}
        >
          云台{t('device.controlPower.title')}
          {operator ? ` (${operator})` : ''}
        </Button>
      </div>
    </div>
  )
})

SmartCarGimbalOperatorPanel.displayName = 'SmartCarGimbalOperatorPanel'

export default SmartCarGimbalOperatorPanel
