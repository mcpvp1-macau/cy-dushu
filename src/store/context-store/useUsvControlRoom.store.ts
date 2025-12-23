import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { useLatest, useMemoizedFn } from 'ahooks'
import useUserStore from '../useUser.store'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import { shouldJson } from '@/utils/json'

export type UsvControlState = API_DEVICE.domain.Properties & {
  heading?: number
  pitch?: number
  roll?: number
  longitude?: number
  latitude?: number
  imageData?: string[]
}

type StateType = {
  productKey: string
  deviceId: string
  /** WebSocket 状态 */
  wsReadyState: number
  /** 合并的状态 */
  state: UsvControlState
  /** 最新收到的状态 */
  latestState: UsvControlState
  /** 控制权 UUID */
  uuid?: string
  /** 是否有控制权 */
  hasControlPower: boolean
  /** 地图视角是否跟随无人船 */
  lockUsvMapView: boolean
  pointSail: {
    /** 是否开启指点航行 */
    open: boolean
    /** 目标经纬度 */
    targetPosition: [number, number] | null
  }
}

type ActionsType = {
  resetState: () => void
  updateProdctKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  updateUUID: (uuid: string) => void
  /** 更新地图视角跟随 */
  updateLockUsvMapView: (enable: boolean) => void
  updatePointSail: (data: StateType['pointSail']) => void
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
    uuid: localStorage?.getItem('UsvControlTag'),
    hasControlPower: false,
    lockUsvMapView: true,
    pointSail: {
      open: false,
      targetPosition: null,
    },
  } as StateType)

export const createUsvControlRoomStore = (senders: WsSendersType) => {
  return createStore<StateType & ActionsType & WsSendersType & CustomerSenderType>()(
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
              tid: uuidv4(),
              method,
              productKey: get().productKey,
              deviceId: get().deviceId,
              data: {
                ...value,
                controlTag: get().uuid,
                sendTime: dayjs().valueOf(),
                sendTimeFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              },
            }),
          )
        },
        updateProdctKeyAndDeviceId: (productKey, deviceId) => {
          set({ productKey, deviceId }, false, 'updateProdctKeyAndDeviceId')
        },
        updateWsReadyState: (state: StateType['wsReadyState']) => {
          set({ wsReadyState: state }, false, 'updateWsReadyState')
        },
        updateState: (state: StateType['latestState']) => {
          set(
            {
              latestState: state,
              state: { ...get().state, ...state },
              hasControlPower: !!(get().uuid && get().uuid === state?.controlTag),
            },
            false,
            'updateState',
          )
        },
        updateUUID: (uuid: string) => {
          localStorage?.setItem('UsvControlTag', uuid)
          set(
            {
              uuid,
              hasControlPower: !!(uuid && uuid === get().state?.controlTag),
            },
            false,
            'updateUUID',
          )
        },
        updateLockUsvMapView: (enable) => {
          set({ lockUsvMapView: enable }, false, 'updateLockUsvMapView')
        },
        updatePointSail: (data) => {
          set({ pointSail: data }, false, 'updatePointSail')
        },
      }),
      {
        name: 'usv-control-room-store',
        enabled: import.meta.env.DEV && false,
      },
    ),
  )
}

export type UsvControlRoomStoreType = ReturnType<typeof createUsvControlRoomStore>

export const UsvControlRoomStoreContext =
  createContext<UsvControlRoomStoreType | null>(null)

export const useUsvControlRoomStore = <T>(
  select: (state: StateType & ActionsType & WsSendersType & CustomerSenderType) => T,
) => {
  const store = useContext(UsvControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建无人船驾驶舱 store
 */
export const useCreateUsvControlRoomStore = (
  productKey: string,
  deviceId: string,
  onWebSocketData?: (data: any) => void,
) => {
  const storeRef = useRef<UsvControlRoomStoreType | null>(null)

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
      case 'event.image.data':
        storeRef.current?.getState().updateState({ imageData: wsData.data?.images || [] })
        break
      default:
        break
    }

    onWebSocketData?.(wsData)
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
    storeRef.current = createUsvControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
    storeRef.current.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  useEffect(() => {
    storeRef.current?.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }, [productKey, deviceId])

  return storeRef.current
}
