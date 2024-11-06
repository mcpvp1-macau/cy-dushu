import useMixARStore from '@/store/control-room/useMixAR.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { memo, useEffect, useRef, useState, type FC } from 'react'
import * as turf from '@turf/turf'
import GeoJSONRbush from 'geojson-rbush'
import { Feature, LineString } from 'geojson'
import { useThrottleEffect } from 'ahooks'
import { useAppMsg } from '@/hooks/useAppMsg'
import { isNil } from 'lodash'
import { getGeoSearchData } from '@/service/modules/geo'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import gimbalMap from '@/constant/uav/gimbal'

type PropsType = unknown

const MixARResolver: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const uav = useMixARStore((s) => s.uavProperties)

  const lastCoordinates = useRef<[number, number] | undefined>(undefined)
  const [range, setRange] = useState<[number, number][] | undefined>()

  useEffect(() => {
    if (!uav.longitude || !uav.latitude) {
      return
    }
    const to = turf.point([uav.longitude, uav.latitude])
    if (lastCoordinates.current) {
      const from = turf.point(lastCoordinates.current)
      const distance = turf.distance(from, to, { units: 'meters' })
      if (distance < 500) {
        return
      }
    }
    lastCoordinates.current = [uav.longitude, uav.latitude]
    const rt = turf.rhumbDestination(to, 2000, 45, { units: 'meters' })
    const lb = turf.rhumbDestination(to, 2000, 225, { units: 'meters' })
    setRange([
      [lb.geometry.coordinates[0], lb.geometry.coordinates[1]],
      [rt.geometry.coordinates[0], rt.geometry.coordinates[1]],
    ])
  }, [uav.longitude, uav.latitude])

  const { data } = useQuery(
    {
      queryKey: ['geo-search', range],
      queryFn: () =>
        getGeoSearchData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
    },
    queryClient,
  )

  const updateRTree = useMixARStore((s) => s.updateRTree)
  const rTree = useMixARStore((s) => s.rTree)

  useEffect(() => {
    if (!data) {
      return
    }
    const geojsonTree = GeoJSONRbush()
    geojsonTree.load({
      type: 'FeatureCollection',
      features: data,
    })
    updateRTree(geojsonTree)
  }, [data])

  const gimbalPick = useMixARStore((s) => s.gimbalPick)
  const updateFeatures = useMixARStore((s) => s.updateFeatures)

  // 激光测距
  // const laserDistance = useUavControlRoomStore((s) => s.state.laserDistance)

  const height = useUavControlRoomStore((s) => s.state.height)

  const enable = useMixARStore((s) => s.enable)
  const updateEnable = useMixARStore((s) => s.updateEnable)
  const updateStartInfo = useMixARStore((s) => s.updateStartInfo)
  const msgApi = useAppMsg()

  useEffect(() => {
    if (!enable) {
      return
    }
    // if (isNil(laserDistance) || laserDistance <= 0) {
    //   msgApi.error('虚实融合开启失败: 测量激光距离')
    //   updateEnable(false)
    //   return
    // }
    if (!uav?.gimbalPitch) {
      msgApi.error('虚实融合开启失败: 无法获取无人机姿态')
      updateEnable(false)
      return
    }
    if (uav.gimbalPitch >= 0) {
      msgApi.error('虚实融合开启失败: 云台俯仰角度大于0')
      updateEnable(false)
      return
    }
    if (isNil(gimbalMap[uav.cameraType!])) {
      msgApi.error('虚实融合开启失败: 无法获取相机参数')
      updateEnable(false)
      return
    }
    const c = (Math.abs(uav.gimbalPitch) * Math.PI) / 180
    const h = 0 * Math.sin(c)
    updateStartInfo({
      startHeight: h,
      startAGL: uav.altitude ?? height ?? 0,
    })
  }, [enable])

  useThrottleEffect(
    () => {
      if (!rTree || !gimbalPick) {
        updateFeatures([])
        return
      }
      const coordinates = [
        gimbalPick.leftBottom,
        gimbalPick.leftTop,
        gimbalPick.rightTop,
        gimbalPick.rightBottom,
      ].filter((v) => !!v)
      // 查询与给定边界相交的 GeoJSON Features
      const searchResult = rTree.search({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        properties: {},
      })
      if (coordinates.length < 4) {
        updateFeatures([])
        return
      }
      const features = searchResult.features as Feature<LineString>[]
      updateFeatures(
        features.filter((e) => e.properties?.name || e.properties?.RoadName),
      )
    },
    [rTree, gimbalPick],
    {
      wait: 2000,
    },
  )

  return null
})

MixARResolver.displayName = 'MixARResolver'

export default MixARResolver
