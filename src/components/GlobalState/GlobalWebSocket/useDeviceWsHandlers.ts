import {
  getAllDeviceList,
  getProductFieldsByIdentifier,
} from '@/service/modules/device'
import { useInterval, useLatest, useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { isEqual, isNil } from 'lodash'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { shouldJson } from '@/utils/json'
import useDeviceInactiveStore from '@/store/setting/useDeviceInactiveSetting.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { pathCompress3D } from '@/utils/path'
import { realDensityMapEmitter } from '@/store/map/useDensityMap.store'
import { useMemo } from 'react'
import { type QueryClient, useQuery } from '@tanstack/react-query'

export const useDeviceWsHandlers = (queryClient: QueryClient) => {
  const { data } = useQuery(
    {
      queryKey: ['getProductFieldsByIdentifier', 'targetInfo'],
      queryFn: () => getProductFieldsByIdentifier({ functionIdentifier: 'targetInfo' }),
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
      const a = item.fields.find((field) => field.identifier === 'targetType')
      if (a) {
        const specs = JSON.parse(a.specs)
        if (Array.isArray(specs)) {
          specs.forEach((v) => {
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

  const updateRadarTarget = useGlobalWsStore((s) => s.updateRadarTarget)
  const handleRadarTarget = useMemoizedFn((obj: any) => {
    const { parentId, deviceId, data } = obj

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
    const nextTarget = newArr.reduce((acc, item) => {
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
        productKey: data?.productKey || allDeviceListMapRef.current[deviceId]?.productKey,
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

    Object.entries(oldmap).forEach(([targetId, oldTarget]) => {
      if (
        !nextTarget[targetId] &&
        oldTarget[0].uploadMode === 'TIANLANG' &&
        oldTarget[oldTarget.length - 1].targetState !== 0
      ) {
        nextTarget[targetId] = oldTarget
      }
    })

    const targetMap = {
      ...target,
      [parentId]: {
        ...parentDevice,
        [deviceId]: nextTarget,
      },
    }
    updateRadarTarget(targetMap)
  })

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

        const tracks = {
          ...useMapDevicesStore.getState().deviceInActiveTracks,
        }
        const trackOpen = useDeviceInactiveStore.getState().trackOpen
        for (const item of data) {
          const { deviceId: id } = item
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

  return {
    handleNewDeviceStatus,
  }
}
