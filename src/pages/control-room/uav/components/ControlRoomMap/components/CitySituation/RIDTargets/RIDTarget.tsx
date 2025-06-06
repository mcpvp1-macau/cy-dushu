import { Billboard, useCesium } from 'resium'
import { ControlStationInfo, UavInfo } from './types'
import csIcon from '/images/marker/icon/controlStation.svg'
import * as Cesium from 'cesium'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { getCitySituationUavDetail } from '@/service/modules/db-api/citySituation'
import AppSpin from '@/components/AppSpin'
import HistoryTrack from '@/components/map/HistoryTrack'
import DeviceLabel from '@/components/map/device/DeviceLabel'

type PropsType = {
  id: string
  uav: UavInfo[]
  cs: ControlStationInfo[]
}

const RIDTarget: FC<PropsType> = memo(({ id, uav, cs }) => {
  const [open, { setTrue, setFalse }] = useBoolean()
  const [csOpen, { setTrue: setCsTrue, setFalse: setCsFalse }] = useBoolean()

  const { viewer } = useCesium()
  const lng = uav.at(-1)!.lng
  const lat = uav.at(-1)!.lat

  const queryClient = useQueryClient()
  const { data: detail, isLoading } = useQuery(
    {
      queryKey: ['rid-uav', id],
      queryFn: () => getCitySituationUavDetail({ id }),
      enabled: open || csOpen,
      select: (d) => d.data,
    },
    queryClient,
  )
  const postion = Cesium.Cartesian3.fromDegrees(lng, lat)
  const csPosition = Cesium.Cartesian3.fromDegrees(
    cs.at(-1)?.lng ?? 120,
    cs.at(-1)?.lat ?? 30,
  )

  return (
    <>
      {uav.length > 0 && (
        <>
          <Billboard
            id={`uav-${id}`}
            position={postion}
            image={'/images/marker/icon/uav_rid.svg'}
            width={26}
            height={26}
            disableDepthTestDistance={50000}
            heightReference={Cesium.HeightReference.NONE}
            onClick={setTrue}
            rotation={Cesium.Math.toRadians(uav.at(-1)!.orientation ?? 0)}
          />
          <DeviceLabel id={`uav-${id}-label`} position={postion} text={id} />
          {open && viewer && (
            <>
              <BoardMarker3D id={`uav-${id}`} map={viewer} lng={lng} lat={lat}>
                <div className="bg-ground-3 border border-ground-5 border-solid rounded py-1 px-2 text-fore text-xs whitespace-nowrap">
                  {isLoading || !detail ? (
                    <AppSpin />
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="flex gap-1 items-center text-sm text-white">
                          {detail.uavInfo[0]?.name || '-'}
                        </p>
                        <IconButton>
                          <IconClose
                            className="scale-[120%]"
                            onClick={setFalse}
                          />
                        </IconButton>
                      </div>
                      <div className="flex">
                        <p>ID: {id}</p>
                      </div>
                      <div className="flex">
                        <p>
                          经纬度: {lng}, {lat}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p>高度: {uav.at(-1)!.height} m</p>
                        <p>海拔: {uav.at(-1)!.alt} m</p>
                      </div>
                    </>
                  )}
                </div>
              </BoardMarker3D>
              <HistoryTrack value={uav} useCallback />
            </>
          )}
        </>
      )}
      {cs.length > 0 && (
        <>
          <Billboard
            id={`cs-${id}`}
            position={csPosition}
            image={csIcon}
            width={26}
            height={26}
            disableDepthTestDistance={50000}
            heightReference={Cesium.HeightReference.NONE}
            onClick={setCsTrue}
          />
          <DeviceLabel
            id={`cs-${id}-label`}
            position={csPosition}
            text={`${id}-控制站`}
          />
          {csOpen && viewer && (
            <>
              <BoardMarker3D
                id={`cs-${id}`}
                map={viewer}
                lng={cs.at(-1)!.lng}
                lat={cs.at(-1)!.lat}
              >
                <div className="bg-ground-3 border border-ground-5 border-solid rounded py-1 px-2 text-fore text-xs whitespace-nowrap">
                  <div className="flex justify-between items-center gap-2">
                    <p className="flex gap-1 items-center text-sm text-white">
                      {detail?.controlStationInfo[0]?.id || '-'}
                    </p>
                    <IconButton>
                      <IconClose className="scale-125" onClick={setCsFalse} />
                    </IconButton>
                  </div>
                  <div className="flex">
                    <p>
                      经纬度: {cs.at(-1)!.lng}, {cs.at(-1)!.lat}
                    </p>
                  </div>
                </div>
              </BoardMarker3D>
              <HistoryTrack value={cs} useCallback />
            </>
          )}
        </>
      )}
    </>
  )
})

RIDTarget.displayName = 'RIDTarget'

export default RIDTarget
