import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { useLatest } from 'ahooks'
import useUserStore from '../useUser.store'
import { heartbeat } from '@/constant/websocket'
import useWebSocket from 'react-use-websocket'
import { shouldJson } from '@/utils/json'
import { isEqual } from 'lodash'
import { Btn } from '@/pages/control-room/uav/components/BottomButtons/type'

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
  /** 云台的控制信息 */
  gimbalControlInfo: Partial<{
    /** 偏航角 */
    yaw: number
    /** 俯仰角 */
    pitch: number
  }>
  activeMouseBtn: Btn | null
  /** 是否打开激光测距 */
  openLarser: boolean
  /** 是否打开指点变焦 */
  openPointZoom: 0 | 1 | 2
  enableSmartTrack: boolean

  /** 是否开启指点定位 */
  isCameraChangePosition?: {
    deviceId: string
    productKey: string
    enabled: boolean
    controlTag?: string
  }
}

type ActionsType = {
  resetState: () => void
  updateProdctKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState'], deviceId: string) => void
  updateUUID: (uuid: string) => void

  /** 更新云台控制信息 */
  updateGimbalControlInfo: (value: StateType['gimbalControlInfo']) => void
  /** 更新鼠标按下的按钮 */
  updateActiveMouseBtn: (btn: Btn | null) => void
  /** 更新激光测距 */
  updateOpenLarser: (open: boolean) => void
  /** 更新指点变焦 */
  updateOpenPointZoom: (open: StateType['openPointZoom']) => void

  updateEnableSmartTrack: (enable?: boolean) => void

  /** 开启指点定位 */
  updateIsCameraChangePosition: (
    value: StateType['isCameraChangePosition'],
  ) => void
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
    uavControlInfo: {},
    gimbalControlInfo: {},
    activeMouseBtn: null,
    hasControlPower: false,
    openLarser: false,
    openPointZoom: 0,
    enableSmartTrack: false,
  } as StateType)

export const createWangLouControlRoomStore = (senders: WsSendersType) => {
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
        updateState: (state: StateType['latestState'], deviceId: string) => {
          let s = { ...get().state }
          let hasControlPower = get().hasControlPower
          // 子设备信息也走父设备的websocket，所以在消息上根据设备id区分
          if (deviceId === get().deviceId) {
            s = { ...s, ...state }
            hasControlPower = !!(get().uuid && get().uuid === state?.controlTag)
          } else {
            s = {
              ...s,
              [deviceId]: {
                ...(get().state[deviceId] || {}),
                ...state,
              },
            }
          }
          set(
            {
              latestState: get().state,
              state: s,
              hasControlPower,
            },
            false,
            'updateState',
          )
        },
        updateUUID: (uuid: string) => {
          set(
            {
              uuid,
              hasControlPower: !!(uuid && uuid === get().state?.controlTag),
            },
            false,
            'updateUUID',
          )
        },

        updateGimbalControlInfo: (value) => {
          if (isEqual(value, get().gimbalControlInfo)) {
            return
          }
          const old = get().gimbalControlInfo
          set(
            {
              gimbalControlInfo: {
                ...old,
                ...value,
              },
            },
            false,
            'updateGimbalControlInfo',
          )
        },
        updateActiveMouseBtn: (btn) => {
          set({ activeMouseBtn: btn }, false, 'updateActiveMouseBtn')
        },
        updateOpenLarser: (open) => {
          set({ openLarser: open }, false, 'updateOpenLarser')
        },
        updateOpenPointZoom: (open) => {
          set({ openPointZoom: open }, false, 'updateOpenPointZoom')
        },
        updateEnableSmartTrack: (enable) => {
          set(
            {
              enableSmartTrack:
                enable !== undefined ? enable : !get().enableSmartTrack,
            },
            false,
            'updateEnableSmartTrack',
          )
        },
        updateIsCameraChangePosition: (value) => {
          set(
            { isCameraChangePosition: value },
            false,
            'updateIsCameraChangePosition',
          )
        },
      }),
      {
        name: 'control-room-store',
        enabled: import.meta.env.DEV && false, // 更新频率太高了且数据量大, 不开启了
      },
    ),
  )
}

export type WangLouControlRoomStoreType = ReturnType<
  typeof createWangLouControlRoomStore
>

export const WangLouControlRoomStoreContext =
  createContext<WangLouControlRoomStoreType | null>(null)

export const useWangLouControlRoomStore = <T>(
  select: (
    state: StateType & ActionsType & WsSendersType & CustomerSenderType,
  ) => T,
) => {
  const store = useContext(WangLouControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建望楼驾驶舱 store
 * @param productKey
 * @param deviceId
 * @param onWebSocketData Websocket 数据处理的回调
 * @returns
 */
export const useCreateWangLouControlRoomStore = (
  productKey: string,
  deviceId: string,
  onWebSocketData?: (data: any) => void,
) => {
  const storeRef = useRef<WangLouControlRoomStoreType | null>(null)

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
        storeRef.current?.getState().updateState(wsData.data, wsData.deviceId)
        break

      case 'event.targetInfo.info':
        // 智能追踪 目标信息
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
    storeRef.current = createWangLouControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
    storeRef.current.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  return storeRef.current
}
