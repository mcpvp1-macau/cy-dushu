import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import { useLatest } from 'ahooks'
import { shouldJson } from '@/utils/json'
import useDeviceWsURL from '@/hooks/device/useDeviceWsURL'
import { v4 as uuidv4 } from 'uuid'

type StateType = {
  productKey: string
  deviceId: string
  wsReadyState: number
  state: API_DEVICE.domain.Properties
  latestState: API_DEVICE.domain.Properties
  params: {
    xSpeed: number
    yawSpeed: number
  }
  controlInfo: {
    xSpeed: number
    yawSpeed: number
  }
}

type ActionsType = {
  resetState: () => void
  updateProdctKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  updateParams: (params: StateType['params']) => void
  updateControlInfo: (controlInfo: StateType['controlInfo']) => void
}

type WsSendersType = {
  sendMsg: (msg: string) => void
}

type CustomerSenderType = {
  sendCommand: (method: string, value?: StateType['controlInfo']) => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const getLocalNumberValue = (key: string, fallback: number) => {
  const value = Number(localStorage?.getItem(key))
  return Number.isFinite(value) ? value : fallback
}

const createInitialState = () =>
  ({
    productKey: '',
    deviceId: '',
    wsReadyState: -1,
    state: {},
    latestState: {},
    params: {
      xSpeed: getLocalNumberValue('UGVLinearSpeed', 1.2),
      yawSpeed: getLocalNumberValue('UGVYawSpeed', 0.4),
    },
    controlInfo: {
      xSpeed: 0,
      yawSpeed: 0,
    },
  } as StateType)

export const createUGVControlRoomStore = (senders: WsSendersType) => {
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
              tid: uuidv4(),
              method,
              productKey: get().productKey,
              deviceId: get().deviceId,
              data: {
                ...value,
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
            },
            false,
            'updateState',
          )
        },
        updateParams: (params: StateType['params']) => {
          const payload = {
            xSpeed: clamp(params.xSpeed, 0, 4),
            yawSpeed: clamp(params.yawSpeed, 0, 1),
          }
          set({ params: payload }, false, 'updateParams')
          localStorage?.setItem('UGVLinearSpeed', payload.xSpeed.toString())
          localStorage?.setItem('UGVYawSpeed', payload.yawSpeed.toString())
        },
        updateControlInfo: (controlInfo: StateType['controlInfo']) => {
          set({ controlInfo }, false, 'updateControlInfo')
        },
      }),
      {
        name: 'ugv-control-room-store',
        enabled: import.meta.env.DEV && false,
      },
    ),
  )
}

export type UGVControlRoomStoreType = ReturnType<
  typeof createUGVControlRoomStore
>

export const UGVControlRoomStoreContext =
  createContext<UGVControlRoomStoreType | null>(null)

export const useUGVControlRoomStore = <T>(
  select: (
    state: StateType & ActionsType & WsSendersType & CustomerSenderType,
  ) => T,
) => {
  const store = useContext(UGVControlRoomStoreContext)!
  return useStore(store, select)
}

export const useCreateUGVControlRoomStore = (
  productKey: string,
  deviceId: string,
  onWebSocketData?: (data: any) => void,
) => {
  const storeRef = useRef<UGVControlRoomStoreType | null>(null)

  const handleMessage = useMemoizedFn((evt: WebSocketEventMap['message']) => {
    const wsData = shouldJson(evt.data)
    if (!wsData) {
      return
    }
    switch (wsData.method) {
      case 'event.property.post':
      case 'properties.state':
        storeRef.current?.getState().updateState(wsData.data)
        break
    }
    onWebSocketData?.(wsData)
  })

  const wsUrl = useDeviceWsURL(productKey, deviceId)

  const { readyState, sendMessage } = useWebSocket(
    wsUrl,
    {
      heartbeat,
      onMessage: handleMessage,
      reconnectAttempts: 0x3f3f3f3f,
      retryOnError: true,
      reconnectInterval: 5000,
      shouldReconnect: () => true,
    },
    true,
  )

  const sendMessageRef = useLatest(sendMessage)

  if (!storeRef.current) {
    storeRef.current = createUGVControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
    storeRef.current.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  return storeRef.current
}
