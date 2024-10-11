import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useUserStore from '@/store/useUser.store'

/** 抢夺控制权 */
const useRobControlPower = () => {
  const username = useUserStore((s) => s.user?.username)

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const hasControlTag = useDeviceDetailStore((s) => s.propsHave['controlTag'])
  const updateUUID = useUavControlRoomStore((s) => s.updateUUID)

  const { mutate, isPending } = useMutation({
    mutationFn: (uuid: string) =>
      setDeviceProp(
        productKey,
        deviceId,
        {
          controlTag: uuid,
          oeprator: username,
        },
        { msgPrefix: '控制权获取失败' },
      ),
    onSuccess: ({ data }, uuid) => {
      if (uuid === 'ANY') {
        updateUUID('')
        return
      }
      if ('0' == data.controlTag.result) {
        updateUUID(uuid)
      } else {
        updateUUID('')
      }
    },
    onError: () => {
      updateUUID('')
    },
  })

  return {
    robControlPower: mutate,
    isPending,
    disabled: !hasControlTag,
  }
}

export default useRobControlPower
