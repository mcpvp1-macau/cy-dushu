import { getProductFieldsByIdentifier } from '@/service/modules/device'
import { heartbeat } from '@/constant/websocket'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useUserStore from '@/store/useUser.store'
import { shouldJson } from '@/utils/json'
import { useInterval } from 'ahooks'
import dayjs from 'dayjs'
import { isEqual } from 'lodash'
import { type FC } from 'react'
import useWebSocket from 'react-use-websocket'
import { useEventData } from '@/store/event/useEvent.store'
import { msgEmitter } from '@/pages/control-room/uav/components/Tanqi'
import useReconstructionMapStore, {
  reconstructionMitt,
} from '@/store/map/useReconstructionMap.store'
import { useAppNotification } from '@/hooks/useNotification'

type PropsType = unknown

const GlobalWebSocket: FC<PropsType> = memo(() => {
  const username = useUserStore((s) => s.user?.username)

  const socketUrl = useMemo(() => {
    if (!username) {
      return ''
    }
    return `${globalConfig.globalWs ?? 'ws'}://${location.host}/ws/${username}`
  }, [username])

  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: ['getProductFieldsByIdentifier', 'targetInfo'],
      queryFn: () =>
        getProductFieldsByIdentifier({ functionIdentifier: 'targetInfo' }),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const labelMap = useMemo(() => {
    const map = {}
    data?.forEach((item) => {
      const a = item.fields.find((item) => item.identifier === 'targetType')
      if (a) {
        const s = JSON.parse(a.specs)
        if (Array.isArray(s)) {
          s.forEach((v) => {
            map[v.value] = v.label
          })
        }
      }
    })
    return map
  }, [data])

  const getLabel = (item) => {
    return labelMap[item.targetType]
  }

  // 雷达目标 ------------------------
  const updateRadarTarget = useGlobalWsStore((s) => s.updateRadarTarget)
  const updateActionItemStatus = useGlobalWsStore(
    (s) => s.updateActionItemStatus,
  )
  const handleRadarTarget = useMemoizedFn((obj: any) => {
    const { parentId, deviceId, data } = obj
    // if ('RADAR' !== data?.data?.sourceType)

    const target = useGlobalWsStore.getState().radarTarget || {}
    const parentDevice = target[parentId] || {}
    const oldmap: { [key: string]: any[] } = parentDevice?.[deviceId] || {}
    const newArr = data?.data?.targets || []
    const n = newArr.reduce((acc, item) => {
      if (item.loss_times > 0) return acc

      const targetData = {
        ...item,
        productKey: data?.productKey,
        acquireTimestampFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        source: data?.data?.deviceName,
        sourceType: data?.data?.sourceType || item.sourceType,
        deviceInfo: data?.data?.deviceInfo,
        objectLabel: item.objectLabel || getLabel(item),
        distance: item.distance ?? item.radialDistance,
      }

      return {
        ...acc,
        [item.targetId]: oldmap[item.targetId]
          ? [...oldmap[item.targetId], targetData]
          : [targetData],
      }
    }, {})

    // 处理天朗雷达目标
    Object.entries(oldmap).forEach(([targetId, oldTarget]) => {
      if (
        !n[targetId] &&
        oldTarget[0].uploadMode === 'TIANLANG' &&
        oldTarget[oldTarget.length - 1].targetState !== 0
      ) {
        n[targetId] = oldTarget
      }
    })

    const targetMap = {
      ...target,
      [parentId]: {
        ...parentDevice,
        [deviceId]: n,
      },
    }
    updateRadarTarget(targetMap)
  })

  // 设备状态变化 ---------------------
  const updateDeviceRealtimeProperties = useGlobalWsStore(
    (s) => s.updateDeviceRealtimeProperties,
  )
  const handleNewDeviceStatus = useMemoizedFn((message: string) => {
    const obj = shouldJson(message)
    const { data, type } = obj
    switch (type) {
      case 'PROPERTIES':
        const pro: any = {}
        const os: Record<string, string> = {}
        for (const item of data) {
          const { deviceId: id } = item
          pro[id] = item
          os[id] = item.deviceStatus
        }
        updateDeviceRealtimeProperties(pro)
        // 判断是否需要刷新设备列表
        if (!isEqual(useGlobalWsStore.getState().onlineStatus, os)) {
          queryClient.invalidateQueries({
            queryKey: ['deviceTreeList'],
            exact: false,
          })
        }
        break
      case 'DEVICE_DISCOVERY':
        const newOS = useGlobalWsStore.getState().onlineStatus
        let needRefresh = false
        for (const item of data) {
          const { deviceId: id } = item
          if (newOS[id] !== item.deviceStatus) {
            newOS[id] = item.deviceStatus
            needRefresh = true
          }
        }
        if (needRefresh) {
          queryClient.invalidateQueries({
            queryKey: ['deviceTreeList'],
            exact: false,
          })
        }
        break
      case 'DEVICE_EVENT':
        if (data.method === 'event.targetInfo.info') {
          handleRadarTarget(obj)
        }
        break
    }
  })

  // 事件推送 ------------------------
  const { refetch } = useEventData()
  const updateNewEvent = useGlobalWsStore((s) => s.updateNewEvent)
  const handleEventPush = useMemoizedFn((message: any) => {
    //
    refetch()
    updateNewEvent(message)
  })

  // 日志 ----------------------------
  const updateNewLog = useGlobalWsStore((s) => s.updateNewLog)
  const handleActionLog = useMemoizedFn((message: any) => {
    updateNewLog(message)
  })

  const updateRefreshTemporary = useGlobalWsStore(
    (s) => s.updateRefreshTemporary,
  )
  const handleTemporaryDetectResult = useMemoizedFn((message: any) => {
    updateRefreshTemporary({ ...message, time: dayjs().valueOf() })
  })

  const handleActionItemStatus = useMemoizedFn((message: any) => {
    const data = shouldJson<any[]>(message)
    if (!data) {
      return
    }
    const res = data.reduce<Record<string, any>>((prev, e) => {
      if (e.deviceId) {
        prev[e.deviceId] = {
          actionItemId: e.actionItemId,
          status: e.status,
        }
      }
      return prev
    }, {})
    updateActionItemStatus(res)
  })

  const handleDialogResponse = useMemoizedFn((message: any) => {
    msgEmitter.emit('message', message)
  })

  // 三维重建完成 ----------------------------
  const notificationApi = useAppNotification()
  const [t] = useTranslation()
  const requestAndUpdateLayerList = useReconstructionMapStore(
    (s) => s.requestAndUpdateLayerList,
  )
  const handleReconstructionTaskEnd = useMemoizedFn((message) => {
    requestAndUpdateLayerList()
    reconstructionMitt.emit('reconstructionTaskEnd', message.overlayId)
    notificationApi.success({
      message: t('mapLayer.reconstructionMap.create.success'),
      duration: 0,
      style: {
        backgroundColor: '#53b176',
        padding: '15px 0 10px 0',
      },
      icon: <></>,
    })
  })

  // websocket message
  const handleMessage = useMemoizedFn((event: WebSocketEventMap['message']) => {
    const { type, message } = shouldJson(event.data) ?? {}
    switch (type) {
      case 'DEVICE_STATUS':
        // no use
        break
      case 'NEW_DEVICE_STATUS':
        handleNewDeviceStatus(message)
        break
      case 'EVENT_STATUS':
        // no use
        break
      case 'EVENT_PUSH':
        handleEventPush(message)
        break
      case 'ACTION_LOG':
        handleActionLog(message)
        break
      case 'TEMPORARY_DETECT_RESULT':
        handleTemporaryDetectResult(message)
        break
      case 'ACTION_ITEM_STATUS':
        handleActionItemStatus(message)
        break
      case 'DIALOG_RESPONSE':
        handleDialogResponse(message)
        break
      case 'RECONSTRUCTION_TASK_END':
        handleReconstructionTaskEnd(message)
        break
    }
  })

  useWebSocket(socketUrl, {
    heartbeat,
    onMessage: handleMessage,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
  })

  // 1分钟清除一次目标
  useInterval(() => {
    const target = useGlobalWsStore.getState().radarTarget || {}
    const newObj = {}
    Object.keys(target).forEach((parentId) => {
      const parentDevice = target[parentId] || {}
      Object.keys(parentDevice).forEach((deviceId) => {
        const oldmap = parentDevice?.[deviceId] || {}
        Object.keys(oldmap).forEach((targetId) => {
          const t = oldmap[targetId]
          const last = t[t.length - 1]
          if (dayjs().diff(dayjs(last.acquireTimestampFormat), 's') < 30) {
            if (!newObj[parentId]) {
              newObj[parentId] = {}
            }
            if (!newObj[parentId][deviceId]) {
              newObj[parentId][deviceId] = {}
            }
            newObj[parentId][deviceId][targetId] = t
          }
        })
      })
    })
    updateRadarTarget(newObj)
  }, 10 * 1000)

  return null
})

GlobalWebSocket.displayName = 'GlobalWebSocket'

export default GlobalWebSocket
