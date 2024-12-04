import {
  getGeoSearchAOIData,
  getGeoSearchPOIData,
  getGeoSearchRoadData,
} from '@/service/modules/geo'
import useMixARStore from '@/store/control-room/useMixAR.store'
import * as turf from '@turf/turf'

type PropsType = unknown

const ARSenceUpdateData: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)

  const lastCoordinates = useRef<[number, number] | undefined>(undefined)
  const [range, setRange] = useState<[number, number][] | undefined>()

  const queryClient = useQueryClient()

  const { data: poiData } = useQuery(
    {
      queryKey: ['geo-search', 'poi', range],
      queryFn: () =>
        getGeoSearchPOIData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
    },
    queryClient,
  )
  const updatePOIs = useMixARStore((s) => s.updatePOIs)
  useEffect(() => {
    if (Array.isArray(poiData)) {
      updatePOIs(poiData)
    }
  }, [poiData])

  // AOI ========================================
  const { data: aoiData } = useQuery(
    {
      queryKey: ['geo-search', 'aoi', range],
      queryFn: () =>
        getGeoSearchAOIData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
    },
    queryClient,
  )

  const updateAOIs = useMixARStore((s) => s.updateAOIs)

  useEffect(() => {
    if (Array.isArray(aoiData)) {
      updateAOIs(aoiData)
    }
  }, [aoiData])

  // 道路 ========================================
  const { data: roadData } = useQuery(
    {
      queryKey: ['geo-search', 'road', range],
      queryFn: () =>
        getGeoSearchRoadData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
    },
    queryClient,
  )
  const updateRoads = useMixARStore((s) => s.updateRoads)
  useEffect(() => {
    if (Array.isArray(roadData)) {
      updateRoads(roadData)
    }
  }, [roadData])

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

  return null
})

ARSenceUpdateData.displayName = 'ARSenceUpdateData'

export default ARSenceUpdateData
