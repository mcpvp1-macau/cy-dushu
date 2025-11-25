import { memo, useEffect, type FC } from 'react'
import {
  useCreateRebotDogControlRoomStore,
  type RebotDogControlRoomStoreType,
} from '@/store/context-store/useRebotDogControlRoom.store'
import {
  ClusterRobotDog,
  useRebotDogClusterStore,
} from '@/store/control-room/useRebotDogCluster.store'

type PropsType = {
  dog: ClusterRobotDog
}

const RobotDogClient: FC<PropsType> = memo(({ dog }) => {
  const updateDogState = useRebotDogClusterStore((s) => s.updateDogState)
  const registerStore = useRebotDogClusterStore((s) => s.registerStore)
  const unregisterStore = useRebotDogClusterStore((s) => s.unregisterStore)

  const store = useCreateRebotDogControlRoomStore(
    dog.productKey,
    dog.deviceId,
    (wsData) => {
      if (
        wsData.method === 'event.property.post' ||
        wsData.method === 'properties.state'
      ) {
        updateDogState(dog.deviceId, wsData.data)
      }
    },
  )

  useEffect(() => {
    registerStore(dog.deviceId, store as RebotDogControlRoomStoreType)
    return () => {
      unregisterStore(dog.deviceId)
    }
  }, [dog.deviceId, store])

  return null
})

RobotDogClient.displayName = 'RobotDogClient'

export default RobotDogClient
