import {
  getAllDeviceList,
  getProductFieldsByIdentifier,
} from '@/service/modules/device'
import { heartbeat } from '@/constant/websocket'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useUserStore from '@/store/useUser.store'
import { shouldJson } from '@/utils/json'
import { useInterval, useLatest } from 'ahooks'
import dayjs from 'dayjs'
import { isEqual, isNil } from 'lodash'
import { type FC } from 'react'
import useWebSocket from 'react-use-websocket'
import { msgEmitter } from '@/pages/control-room/uav/components/Tanqi'
import useReconstructionMapStore, {
  reconstructionMitt,
} from '@/store/map/useReconstructionMap.store'
import { useAppNotification } from '@/hooks/useNotification'
import { realDensityMapEmitter } from '@/store/map/useDensityMap.store'
import { processEventImageDataEmitter } from '@/store/map/useReconstruction2DMap.store'
import useDeviceInactiveStore from '@/store/setting/useDeviceInactiveSetting.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { pathCompress3D } from '@/utils/path'
import { deviceRelayEmitter } from './DeviceRelay'
import useHandlePushEvent from './GlobalWebSocket/useHandlePushEvent'

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

  const { data: allDeviceList = [] } = useQuery(
    {
      queryKey: ['getAllDeviceList'],
      queryFn: () =>
        getAllDeviceList({
          isPage: false,
        }),
      select: (d) => d.data.rows || [],
    },
    queryClient,
  )

  // 设备列表，用于过滤掉非本组织可见的设备
  const allDeviceListMap = useMemo(() => {
    return allDeviceList.reduce((acc, item) => {
      acc[item.deviceId] = item
      return acc
    }, {})
  }, [allDeviceList])

  const allDeviceListMapRef = useLatest(allDeviceListMap)

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

    // 如果设备不存在，则不处理
    if (
      !allDeviceListMapRef.current[deviceId] &&
      !allDeviceListMapRef.current[parentId]
    ) {
      return
    }

    const target = useGlobalWsStore.getState().radarTarget || {}
    const parentDevice = target[parentId] || {}
    const oldmap: { [key: string]: any[] } = parentDevice?.[deviceId] || {}
    const newArr = data?.data?.targets || []
    const n = newArr.reduce((acc, item) => {
      if (item.loss_times > 0) return acc

      if (
        isNil(item.targetLongitude) ||
        isNil(item.targetLatitude) ||
        isNil(item.targetAltitude)
      ) {
        return acc
      }

      const targetData = {
        ...item,
        productKey:
          data?.productKey || allDeviceListMapRef.current[deviceId]?.productKey,
        acquireTimestampFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        source: data?.data?.deviceName,
        sourceType: data?.data?.sourceType || item.sourceType,
        deviceInfo: data?.data?.deviceInfo,
        objectLabel: item.objectLabel || getLabel(item),
        distance: item.distance ?? item.radialDistance,
        deviceId: deviceId,
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

        // 处理失活轨迹
        const tracks = {
          ...useMapDevicesStore.getState().deviceInActiveTracks,
        }
        const trackOpen = useDeviceInactiveStore.getState().trackOpen
        for (const item of data) {
          const { deviceId: id } = item
          // 如果设备不存在，则不处理
          if (!allDeviceListMapRef.current[id]) {
            continue
          }
          pro[id] = item
          os[id] = item.deviceStatus
          if (
            trackOpen[id] &&
            item.properties.longitude &&
            item.properties.latitude
          ) {
            const currentTracks = tracks[id] ?? []
            const point: (typeof currentTracks)[number][number] = {
              lng: item.properties.longitude,
              lat: item.properties.latitude,
              alt: item.properties.altitude ?? 0,
            }
            if (currentTracks.length === 0) {
              tracks[id] = [[point]]
            } else {
              let lastTrack = currentTracks.at(-1)!
              if (lastTrack.length === 64) {
                tracks[id] = [...currentTracks, [point]]
              } else {
                lastTrack = pathCompress3D([...lastTrack, point])
                tracks[id] = [...currentTracks.slice(0, -1), lastTrack]
              }
            }
          }
        }
        useMapDevicesStore.getState().updateDeviceInActiveTracks(tracks)
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
          // 设备存在，则更新设备状态
          if (allDeviceListMapRef.current[id]) {
            if (newOS[id] !== item.deviceStatus) {
              newOS[id] = item.deviceStatus
              needRefresh = true
            }
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
        } else if (data.method === 'event.densityMap.info') {
          // 设备存在，则更新设备状态
          if (allDeviceListMapRef.current[obj.deviceId]) {
            const data2 = data.data as {
              densityMap: {
                h3Code: string
                averageDensity: number
              }[]
              statisticalInterval: number
              resolution: number
              timestamp: number
            }
            realDensityMapEmitter.emit('densityMap', {
              deviceId: obj.deviceId,
              data: data2.densityMap,
            })
          }
        }
        break
    }
  })

  // 事件/告警推送 ------------------------
  const { handleEventPush, handleAlarmPush } = useHandlePushEvent()

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
        backgroundColor: '#15B371',
        padding: '8px 0',
        width: '280px',
        borderRadius: '4px',
      },
      icon: <></>,
    })
  })

  const handleFlightAreaMessage = useMemoizedFn((message: any, key: string) => {
    notificationApi.success({
      message: message,
      duration: 0,
      key,
      style: {
        backgroundColor: '#dd4444',
        padding: '8px 20px 8px 0px',
        width: 'fit-content',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      },
      icon: <></>,
    })
  })
  interface ImageData {
    id: number
    requestId: string
    actionId: number
    deviceId: string
    index: number
    imageUrl: string // 图片地址
    taskDone: boolean // 是否已完成，为true时imageUrl为合成的大图
    imageType: 'jpeg' | 'tiff' // jpeg/tiff
    meta?: {
      // 图片格式为 tiff 时为空
      absoluteAltitude: number
      gimbalPitch: number
      gimbalRoll: number
      gimbalYaw: number
      gpsLatitude: number
      gpsLongitude: number
      lenType: 'WIDE' | 'IR' | 'ZOOM' // WIDE/IR/ZOOM
      productName: string // 有镜头型号使用镜头型号，没有镜头使用无人机型号，如 H30T,ZH20T,M30T,M3TD,M4TD
      relativeAltitude: number
    }
  }
  /** 处理二维重建结果 */
  const handle2DResult = useMemoizedFn((message: ImageData) => {
    processEventImageDataEmitter.emit('processEventImageData', message)
  })

  const handleRelayEvent = useMemoizedFn(
    (message: { breakPointId: number; actionId: number; deviceId: string }) => {
      deviceRelayEmitter.emit('notify', message)
    },
  )

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
      case 'ALARMS':
        handleAlarmPush(message)
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
      case 'NO_FLY_ZONE_WARN':
        handleFlightAreaMessage(message, 'NO_FLY_ZONE_WARN')
        break
      case 'ELECTRONIC_FENCE_WARN':
        handleFlightAreaMessage(message, 'ELECTRONIC_FENCE_WARN')
        break
      case 'TWO_DIMENSION_RESULT':
        handle2DResult(message)
        break
      case 'ACTION_RELAY_EVENT':
        // 断点续飞
        handleRelayEvent(message)
        break

      case 'OVERLAY_SHARE':
        // 共享结果
        console.log('收到覆盖物共享结果', message)
        notificationApi.success({
          message: `收到${message.senderUserId}分享的覆盖物${message.overlayName}`,
          duration: 0,
          style: {
            backgroundColor: '#15B371',
            padding: '8px 0',
            width: '280px',
            borderRadius: '4px',
          },
          icon: <></>,
        })
        queryClient.invalidateQueries({
          queryKey: ['overlayList'],
          exact: false,
        })
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
  useInterval(
    () => {
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
    },
    globalConfig.is72 ? 15 * 60 * 1000 : 10 * 1000,
  )

  return null
})

GlobalWebSocket.displayName = 'GlobalWebSocket'

export default GlobalWebSocket
