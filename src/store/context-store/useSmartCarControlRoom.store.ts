import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useLatest, useMemoizedFn } from 'ahooks'
import useUserStore from '../useUser.store'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import { shouldJson } from '@/utils/json'

export type SmartCarControlState = API_DEVICE.domain.Properties & {
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
  state: SmartCarControlState
  /** 最新收到的状态 */
  latestState: SmartCarControlState
  /** 地图视角是否跟随智慧警车 */
  lockSmartCarMapView: boolean
}

type ActionsType = {
  resetState: () => void
  updateProductKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  /** 更新地图视角跟随 */
  updateLockSmartCarMapView: (enable: boolean) => void
}

type WsSendersType = {
  sendMsg: (msg: string) => void
}

type CustomerSenderType = {
  sendCommand: (method: string, value: any) => void
}

const createInitialState = () =>
  ({
    productKey: '',
    deviceId: '',
    wsReadyState: -1,
    state: {},
    latestState: {},
    lockSmartCarMapView: true,
  } as StateType)

export const createSmartCarControlRoomStore = (senders: WsSendersType) => {
  return createStore<
    StateType & ActionsType & WsSendersType & CustomerSenderType
  >()(
    devtools(
      (set, get) => ({
        ...createInitialState(),
        ...senders,
        resetState: () => {
          set(createInitialState(), false, 'resetState')
        },
        sendCommand: (method, value) => {
          get().sendMsg(
            JSON.stringify({
              method,
              productKey: get().productKey,
              deviceId: get().deviceId,
              data: value ?? {},
            }),
          )
        },
        updateProductKeyAndDeviceId: (productKey, deviceId) => {
          set({ productKey, deviceId }, false, 'updateProductKeyAndDeviceId')
        },
        updateWsReadyState: (state: StateType['wsReadyState']) => {
          set({ wsReadyState: state }, false, 'updateWsReadyState')
        },
        updateState: (state: StateType['latestState']) => {
          set(
            {
              latestState: state,
              state: { ...get().state, ...state },
            },
            false,
            'updateState',
          )
        },
        updateLockSmartCarMapView: (enable) => {
          set(
            { lockSmartCarMapView: enable },
            false,
            'updateLockSmartCarMapView',
          )
        },
      }),
      {
        name: 'smart-car-control-room-store',
        enabled: import.meta.env.DEV && false,
      },
    ),
  )
}

export type SmartCarControlRoomStoreType = ReturnType<
  typeof createSmartCarControlRoomStore
>

export const SmartCarControlRoomStoreContext =
  createContext<SmartCarControlRoomStoreType | null>(null)

export const useSmartCarControlRoomStore = <T>(
  select: (
    state: StateType & ActionsType & WsSendersType & CustomerSenderType,
  ) => T,
) => {
  const store = useContext(SmartCarControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建智慧警车驾驶舱 store
 */
export const useCreateSmartCarControlRoomStore = (
  productKey: string,
  deviceId: string,
) => {
  const storeRef = useRef<SmartCarControlRoomStoreType | null>(null)

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
        if (wsData.deviceId === deviceId) {
          storeRef.current?.getState().updateState(wsData.data || {})
        }
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

  const { readyState, sendMessage } = useWebSocket(
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

  const sendMessageRef = useLatest(sendMessage)

  if (!storeRef.current) {
    storeRef.current = createSmartCarControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
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
