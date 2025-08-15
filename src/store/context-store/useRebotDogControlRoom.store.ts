import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { useLatest } from 'ahooks'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import { shouldJson } from '@/utils/json'
import useDeviceWsURL from '@/hooks/device/useDeviceWsURL'
import { Btn } from '@/pages/control-room/rebot-dog/components/ControlButtons/type'

type StateType = {
  productKey: string
  deviceId: string
  /** WebSocket 状态 */
  wsReadyState: number
  /** 合并的状态 */
  state: API_DEVICE.domain.Properties
  /** 最新收到的状态 */
  latestState: API_DEVICE.domain.Properties
  /** 控制权 UUID */
  uuid?: string
  /** 是否有控制权 */
  hasControlPower: boolean
  params: {
    /** 移动速度 */
    speed: number
    /** 姿态弧度 */
    attitude: number
  }
  /** 机器狗的控制信息 */
  dogControlInfo: Partial<{
    /** AD */
    y: number
    /** WS */
    x: number
    /** QE */
    yawSpeed: number
    /** UO */
    yaw: number
    /** IK */
    pitch: number
    /** JL */
    roll: number
  }>
  activeMouseBtn: Btn | null
  activeMapUrl: string | null
  pointAction: {
    /** 是否开启指点前进 */
    open: boolean
    /** 目标xyz */
    targetPosition?: [number, number, number]
  }
}

type ActionsType = {
  resetState: () => void
  updateProdctKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  updateUUID: (uuid: string) => void
  updateDogControlInfo: (dogControlInfo: StateType['dogControlInfo']) => void
  updateActiveMouseBtn: (activeMouseBtn: StateType['activeMouseBtn']) => void
  updateParams: (params: StateType['params']) => void
  updateActiveMapUrl: (activeMapUrl: StateType['activeMapUrl']) => void
  updatePointAction: (pointAction: StateType['pointAction']) => void
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
    uuid: localStorage?.getItem('UavControlTag'),
    hasControlPower: false,
    dogControlInfo: {
      x: 0,
      y: 0,
      yawSpeed: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
    },
    activeMouseBtn: null,
    params: {
      speed: Number(localStorage?.getItem('RebotDogSpeed') || 0.5),
      attitude: Number(localStorage?.getItem('RebotDogAttitude') || 0.5),
    },
    pointAction: {
      open: false,
    },
  } as StateType)

export const createRebotDogControlRoomStore = (senders: WsSendersType) => {
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
              hasControlPower: !!(
                get().uuid && get().uuid === state?.controlTag
              ),
            },
            false,
            'updateState',
          )
        },
        updateUUID: (uuid: string) => {
          localStorage?.setItem('UavControlTag', uuid)
          set(
            {
              uuid,
              hasControlPower: !!(uuid && uuid === get().state?.controlTag),
            },
            false,
            'updateUUID',
          )
        },
        updateDogControlInfo: (dogControlInfo: StateType['dogControlInfo']) => {
          set({ dogControlInfo }, false, 'updateDogControlInfo')
        },
        updateActiveMouseBtn: (activeMouseBtn: StateType['activeMouseBtn']) => {
          set({ activeMouseBtn }, false, 'updateActiveMouseBtn')
        },
        updateParams: (params: StateType['params']) => {
          set({ params }, false, 'updateParams')
          localStorage?.setItem('RebotDogSpeed', params.speed.toString())
          localStorage?.setItem('RebotDogAttitude', params.attitude.toString())
        },
        updateActiveMapUrl: (activeMapUrl: StateType['activeMapUrl']) => {
          set({ activeMapUrl }, false, 'updateActiveMapUrl')
        },
        updatePointAction: (pointAction: StateType['pointAction']) => {
          set({ pointAction: { ...get().pointAction, ...pointAction } }, false, 'updatePointAction')
        },
      }),
      {
        name: 'control-room-store',
        enabled: import.meta.env.DEV && false, // 更新频率太高了且数据量大, 不开启了
      },
    ),
  )
}

export type RebotDogControlRoomStoreType = ReturnType<
  typeof createRebotDogControlRoomStore
>

export const RebotDogControlRoomStoreContext =
  createContext<RebotDogControlRoomStoreType | null>(null)

export const useRebotDogControlRoomStore = <T>(
  select: (
    state: StateType & ActionsType & WsSendersType & CustomerSenderType,
  ) => T,
) => {
  const store = useContext(RebotDogControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建机器狗驾驶舱 store
 * @param productKey
 * @param deviceId
 * @param onWebSocketData Websocket 数据处理的回调
 * @returns
 */
export const useCreateRebotDogControlRoomStore = (
  productKey: string,
  deviceId: string,
  onWebSocketData?: (data: any) => void,
) => {
  const storeRef = useRef<RebotDogControlRoomStoreType | null>(null)

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
      reconnectInterval: 5_000,
      shouldReconnect: () => true,
    },
    true,
  )

  const sendMessageRef = useLatest(sendMessage)

  if (!storeRef.current) {
    storeRef.current = createRebotDogControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
    storeRef.current.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  return storeRef.current
}
