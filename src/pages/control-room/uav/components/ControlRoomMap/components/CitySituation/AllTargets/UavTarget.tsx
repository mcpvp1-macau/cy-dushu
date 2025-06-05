import DeviceLabel from '@/components/map/device/DeviceLabel'
import { Billboard, useCesium } from 'resium'
import * as Cesium from 'cesium'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { round } from 'lodash'
import { getEntityPosition } from '@/service/modules/db-api/citySituation'
import { dft } from '@/constant/time-fmt'
import HistoryTrack from '@/components/map/HistoryTrack'

type PropsType = {
  data: {
    latitude: number
    id: string
    time: string
    type: string
    objectLabel: string
    longitude: number
    altitude?: number
  }
}

const UavTarget: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  const position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude)
  const [openDetail, { setTrue, setFalse }] = useBoolean(false)

  const [openTime, setOpenTime] = useState<string>(data.time)

  const { data: track } = useQuery({
    queryKey: ['citySituationUavTrack', data.id, openTime],
    queryFn: () =>
      getEntityPosition({
        startTime: dayjs(openTime).subtract(1, 'day').format(dft),
        endTime: openTime,
        type: data.type,
        id: data.id,
      }),
    enabled: openDetail,
    select: (d) => d.data,
  })

  const [realPath, setRealPath] = useState<{ lng: number; lat: number }[][]>([
    [{ lng: data.longitude, lat: data.latitude }],
  ])
  useEffect(() => {
    if (!openDetail) {
      setRealPath([[{ lng: data.longitude, lat: data.latitude }]])
      return
    }
    const back = realPath.at(-1)!
    if (back && back.length > 64) {
      const newBack = [
        { lng: back!.at(-1)!.lng, lat: back!.at(-1)!.lat },
        { lng: data.longitude, lat: data.latitude },
      ]
      setRealPath((prev) => [...prev, newBack])
    } else {
      const newBack = [...back, { lng: data.longitude, lat: data.latitude }]
      setRealPath((prev) => [...prev.slice(0, -1), newBack])
    }
  }, [data.longitude, data.latitude, openDetail])

  if (!viewer) {
    return null
  }

  return (
    <>
      <Billboard
        id={`uav-${data.id}`}
        position={position}
        image={'/images/marker/icon/uav_rid.svg'}
        width={26}
        height={26}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
        onClick={() => {
          setTrue()
          setOpenTime(data.time)
        }}
      />
      <DeviceLabel
        id={`uav-${data.id}-label`}
        position={position}
        text={data.id}
      />
      {openDetail && (
        <BoardMarker3D
          id={`cs-${data.id}`}
          map={viewer!}
          lng={data.longitude}
          lat={data.latitude}
        >
          <div className="bg-ground-3 border border-ground-5 border-solid rounded py-1 px-2 text-fore text-xs whitespace-nowrap">
            <div className="flex justify-between items-center gap-2">
              <p className="flex gap-1 items-center text-sm text-white">
                {data?.id || '-'}
              </p>
              <IconButton>
                <IconClose className="scale-125" onClick={setFalse} />
              </IconButton>
            </div>
            <div className="flex">
              <p>
                经纬度: {round(data.longitude, 6)}, {round(data.latitude, 6)}
              </p>
            </div>
          </div>
          {Array.isArray(track) && track.length > 0 && (
            <HistoryTrack
              value={track.map((e) => ({
                lng: e.longitude,
                lat: e.latitude,
              }))}
              clampToGround
            />
          )}
          {openDetail && (
            <>
              {realPath.map((e, i) => (
                <HistoryTrack key={i} value={e} clampToGround />
              ))}
            </>
          )}
        </BoardMarker3D>
      )}
    </>
  )
})

UavTarget.displayName = 'UavTarget'

export default UavTarget
