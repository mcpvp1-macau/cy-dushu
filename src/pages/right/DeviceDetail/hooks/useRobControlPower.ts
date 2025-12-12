import { useDeviceDetailStore } from './useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import useUserStore from '@/store/useUser.store'

/** 抢夺控制权: 需要满足上下文有 DeviceDetailStore */
const useRobControlPower = (updateUUID: Function) => {
  const user = useUserStore((s) => s.user)

  const { t } = useTranslation()

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const hasControlTag = useDeviceDetailStore((s) => s.propsHave['controlTag'])

  const { mutate, isPending } = useMutation({
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
        updateUUID?.('')
        return
      }
      if ('0' == data.controlTag.result) {
        updateUUID?.(uuid)
      } else {
        updateUUID?.('')
      }
    },
    onError: () => {
      updateUUID?.('')
    },
  })

  return {
    robControlPower: mutate,
    isPending,
    disabled: !hasControlTag,
  }
}

export default useRobControlPower
