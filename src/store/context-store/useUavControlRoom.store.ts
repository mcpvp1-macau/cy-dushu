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
  /** 是否受限飞行 */
  isLimitedFly: boolean
  flyParams: {
    open: boolean
    isResetHome: boolean
    isExecute: boolean
    flySpeed: number
    targetHeight?: number
  }
  pointFly: {
    /** 是否开启指点飞行 */
    open: boolean
    /** 目标经纬度 */
    targetPosition: [number, number] | null
  }
  /** 无人机的控制信息 */
  uavControlInfo: Partial<{
    /** AD */
    x: number
    /** WS */
    y: number
    /** CZ */
    z: number
    /** QE */
    yaw: number
  }>
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
  /** 是否打开指点飞行 */
  // openPointFly: boolean
  /** 是否启用摇杆 */
  enableGamepad: boolean
  historyTracks: number[][][]
  enableSmartTrack: boolean
}

type ActionsType = {
  resetState: () => void
  updateProdctKeyAndDeviceId: (productKey: string, deviceId: string) => void
  updateWsReadyState: (state: StateType['wsReadyState']) => void
  updateState: (state: StateType['latestState']) => void
  updateUUID: (uuid: string) => void
  /** 更新飞行参数 */
  updateFlyParams: (value: StateType['flyParams']) => void
  updateFlyParamsOpen: (open: boolean, isExecute?: boolean) => void
  /** 更新无人机控制信息 */
  updateUavControlInfo: (value: StateType['uavControlInfo']) => void
  /** 更新云台控制信息 */
  updateGimbalControlInfo: (value: StateType['gimbalControlInfo']) => void
  /** 更新鼠标按下的按钮 */
  updateActiveMouseBtn: (btn: Btn | null) => void
  /** 更新激光测距 */
  updateOpenLarser: (open: boolean) => void
  /** 更新指点变焦 */
  updateOpenPointZoom: (open: StateType['openPointZoom']) => void
  /** 更新指点飞行 */
  updatePointFly: (open: StateType['pointFly']) => void
  /** 更新摇杆开启 */
  updateEnableGamepad: (open: boolean) => void
  /** 更新历史轨迹 */
  updateHistoryTracks: (tracks: StateType['historyTracks']) => void

  updateEnableSmartTrack: (enable?: boolean) => void
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
    flyParams: {
      open: false,
      isResetHome: false,
      isExecute: false,
      flySpeed: 10,
      targetHeight: 120,
    },
    pointFly: {
      open: false,
      targetPosition: null,
    },
    uavControlInfo: {},
    gimbalControlInfo: {},
    activeMouseBtn: null,
    hasControlPower: false,
    isLimitedFly: false,
    openLarser: false,
    openPointZoom: 0,
    openPointFly: false,
    enableGamepad: false,
    historyTracks: [],
    enableSmartTrack: false,
  } as StateType)

export const createUavControlRoomStore = (senders: WsSendersType) => {
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
        updateFlyParams: (value) => {
          set(
            {
              flyParams: value,
            },
            false,
            'updateFlyParams',
          )
        },
        updateFlyParamsOpen: (open, isExecute = false) => {
          set(
            {
              flyParams: { ...get().flyParams, open, isExecute },
            },
            false,
            'updateFlyParamsOpen',
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
              isLimitedFly: !!(
                state.displayMode &&
                (state.displayMode.includes('指点飞行') ||
                  state.displayMode.includes('一键起飞') ||
                  state.displayMode.startsWith('10000'))
              ),
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

        updateUavControlInfo: (value) => {
          if (isEqual(value, get().uavControlInfo)) {
            return
          }
          const old = get().uavControlInfo
          set(
            { uavControlInfo: { ...old, ...value } },
            false,
            'updateUavControlInfo',
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
        updatePointFly: (data) => {
          set({ pointFly: data }, false, 'updateOpenPointFly')
        },
        updateEnableGamepad: (open) => {
          set({ enableGamepad: open }, false, 'updateEnableGamepad')
        },
        updateHistoryTracks: (tracks) => {
          set({ historyTracks: tracks }, false, 'updateHistory')
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
      }),
      {
        name: 'control-room-store',
        enabled: import.meta.env.DEV && false, // 更新频率太高了且数据量大, 不开启了
      },
    ),
  )
}

export type UavControlRoomStoreType = ReturnType<
  typeof createUavControlRoomStore
>

export const UavControlRoomStoreContext =
  createContext<UavControlRoomStoreType | null>(null)

export const useUavControlRoomStore = <T>(
  select: (
    state: StateType & ActionsType & WsSendersType & CustomerSenderType,
  ) => T,
) => {
  const store = useContext(UavControlRoomStoreContext)!
  return useStore(store, select)
}

/**
 * 创建无人机驾驶舱 store
 * @param productKey
 * @param deviceId
 * @param onWebSocketData Websocket 数据处理的回调
 * @returns
 */
export const useCreateUavControlRoomStore = (
  productKey: string,
  deviceId: string,
  onWebSocketData?: (data: any) => void,
) => {
  const storeRef = useRef<UavControlRoomStoreType | null>(null)
  const queryClient = useQueryClient()

  /** WebSocket 处理 */
  const handleMessage = useMemoizedFn((evt: WebSocketEventMap['message']) => {
    const { data } = evt
    const wsData = shouldJson(data)
    if (!wsData) {
      return
    }
    // 双链路切换
    if (wsData.event === 'MULTI_LINK_STATE') {
      queryClient.invalidateQueries({
        queryKey: [
          'getDeviceLinks',
          {
            productKey,
            deviceId,
          },
        ],
      })
      return
    }
    switch (wsData.method) {
      case 'event.property.post':
      case 'properties.state':
        storeRef.current?.getState().updateState(wsData.data)
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
    // return `/proxyWsApi/otherWsService/${globalConfig.systemName}/controlServer/v3/${productKey}/${deviceId}?token=${token}`
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
    storeRef.current = createUavControlRoomStore({
      sendMsg: (msg) => sendMessageRef.current(msg),
    })
    storeRef.current.getState().updateProdctKeyAndDeviceId(productKey, deviceId)
  }

  useEffect(() => {
    storeRef.current?.getState().updateWsReadyState(readyState)
  }, [readyState])

  return storeRef.current
}
