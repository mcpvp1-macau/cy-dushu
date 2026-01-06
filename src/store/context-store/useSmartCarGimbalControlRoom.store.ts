import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useMemoizedFn } from 'ahooks'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import useUserStore from '../useUser.store'
import { shouldJson } from '@/utils/json'

export type SmartCarGimbalControlState = API_DEVICE.domain.Properties & {
  longitude?: number
  latitude?: number
  altitude?: number
}

type StateType = {
  productKey: string
  deviceId: string
  /** WebSocket 状态 */
  wsReadyState: number
  /** 合并的状态 */
  state: SmartCarGimbalControlState
  /** 最新收到的状态 */
  latestState: SmartCarGimbalControlState
  /** 控制权 UUID */
  uuid?: string
  /** 是否有控制权 */
  hasControlPower: boolean
}

type ActionsType = {
  resetState: () => void
  updateProductKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  updateUUID: (uuid: string) => void
}

const createInitialState = (): StateType => ({
  productKey: '',
  deviceId: '',
  wsReadyState: -1,
  state: {},
  latestState: {},
  uuid: localStorage?.getItem('SmartCarGimbalControlTag') ?? '',
  hasControlPower: false,
})

export const createSmartCarGimbalControlRoomStore = () => {
  return createStore<StateType & ActionsType>()(
    devtools(
      (set, get) => ({
        ...createInitialState(),
        resetState: () => {
          set(createInitialState(), false, 'resetState')
        },
        updateProductKeyAndDeviceId: (productKey, deviceId) => {
          set({ productKey, deviceId }, false, 'updateProductKeyAndDeviceId')
        },
        updateWsReadyState: (state: StateType['wsReadyState']) => {
          set({ wsReadyState: state }, false, 'updateWsReadyState')
        },
        updateState: (state: StateType['latestState']) => {
          // 业务规则：控制权字段可能不随每次状态上报，缺失时保持上一次控制权。
          const controlTag = state?.controlTag ?? get().state?.controlTag
          console.log('controlTag', controlTag)
          console.log('get().uuid', get().uuid)
          set(
            {
              latestState: state,
              state: { ...get().state, ...state },
              hasControlPower: !!(get().uuid && get().uuid === controlTag),
            },
            false,
            'updateState',
          )
        },
        updateUUID: (uuid: string) => {
          localStorage?.setItem('SmartCarGimbalControlTag', uuid)
          console.log('updateUUID', uuid)
          set(
            {
              uuid,
              hasControlPower: !!(uuid && uuid === get().state?.controlTag),
            },
            false,
            'updateUUID',
          )
        },
      }),
      {
        name: 'smart-car-gimbal-control-room-store',
        enabled: import.meta.env.DEV && false,
      },
    ),
  )
}

export type SmartCarGimbalControlRoomStoreType = ReturnType<
  typeof createSmartCarGimbalControlRoomStore
>

export const SmartCarGimbalControlRoomStoreContext =
  createContext<SmartCarGimbalControlRoomStoreType | null>(null)

export const useSmartCarGimbalControlRoomStore = <T>(
  select: (state: StateType & ActionsType) => T,
) => {
  const store = useContext(SmartCarGimbalControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建智慧警车云台 store
 */
export const useCreateSmartCarGimbalControlRoomStore = (
  productKey: string,
  deviceId: string,
) => {
  const storeRef = useRef<SmartCarGimbalControlRoomStoreType | null>(null)

  /** WebSocket 处理 */
  const handleMessage = useMemoizedFn((evt: WebSocketEventMap['message']) => {
    const { data } = evt
    const wsData = shouldJson(data)
    if (!wsData) {
      return
    }

    switch (wsData.method) {
      case 'event.property.post':
      case 'properties.state':
        storeRef.current?.getState().updateState(wsData.data || {})
        break
      default:
        break
    }
  })

  const token = useUserStore((s) => s.token)

  const wsUrl = useMemo(() => {
    if (!productKey || !deviceId || !token) {
      return null
    }
    return `${globalConfig.globalWs}://${location.host}/v3/${productKey}/${deviceId}?token=${token}`
  }, [productKey, deviceId, token])

  const { readyState } = useWebSocket(
    wsUrl,
    {
      heartbeat,
      onMessage: handleMessage,
      reconnectAttempts: 0x3f3f3f3f,
      retryOnError: true,
      reconnectInterval: 5_000,
      shouldReconnect: () => true,
    },
    true,
  )

  if (!storeRef.current) {
    storeRef.current = createSmartCarGimbalControlRoomStore()
    storeRef.current
      .getState()
      .updateProductKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  useEffect(() => {
    storeRef.current
      ?.getState()
      .updateProductKeyAndDeviceId(productKey, deviceId)
  }, [productKey, deviceId])

  return storeRef.current
}
