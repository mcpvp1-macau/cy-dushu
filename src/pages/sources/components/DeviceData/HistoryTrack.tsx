import Select from '@/components/AntdOverride/Select'
import { dft } from '@/constant/time-fmt'
import MapboxMap from '@/map/MapboxMap'
import { getTrackQuery } from '@/service/modules/db-api'
import { pathCompress } from '@/utils/path'
import { Dayjs } from 'dayjs'
import { Layer, Source, useMap } from 'react-map-gl'
import { bbox } from '@turf/turf'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

const HistoryTrackChildren: FC<{ tracks: API_DBAPI.res.GetTrackQueryRes }> =
  memo(({ tracks }) => {
    const { current: map } = useMap()

    const renderTracks = useMemo<GeoJSON.Feature>(() => {
      const path = pathCompress(tracks)

      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path?.map((v) => [v.lng, v.lat]) ?? [],
        },
        properties: {},
      }
    }, [tracks])

    useEffect(() => {
      if (
        !map ||
        !(renderTracks.geometry as unknown as GeoJSON.LineString).coordinates
          ?.length
      ) {
        return
      }
      const box = bbox(renderTracks)
      if (!box.length) {
        return
      }
      map?.fitBounds(
        [
          [box[0], box[1]],
          [box[2], box[3]],
        ],
        {
          maxZoom: 15,
          duration: 1000,
          padding: 40,
        },
      )
    }, [renderTracks])

    return (
      <>
        <Source id="path-source" type="geojson" data={renderTracks}>
          <Layer
            id="path-source"
            type="line"
            source="path-source"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': '#ef4444',
              'line-width': 2,
            }}
          />
        </Source>
      </>
    )
  })

const HistoryTrack: FC<PropsType> = memo(({ deviceList }) => {
  const deviceOptions = useMemo(
    () =>
      deviceList.map((e) => ({
        label: e.name,
        value: e.deviceId,
      })),
    deviceList,
  )

  const [deviceId, setDeviceId] = useState<string>(deviceList[0]?.deviceId)

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, 'day').startOf('minute'),
    dayjs().endOf('minute'),
  ])

  const queryClient = useQueryClient()

  const { data: tracks } = useQuery(
    {
      queryKey: [
        [
          'trackQuery',
          {
            deviceId: deviceId,
            startTime: dateRange[0].format(dft),
            endTime: dateRange[1].format(dft),
          },
        ],
      ],
      queryFn: () =>
        getTrackQuery({
          deviceId: deviceId,
          startTime: dateRange[0].format(dft),
          endTime: dateRange[1].format(dft),
        }),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  return (
    <div>
      <div className="my-3 flex gap-2">
        <DateRangePicker
          showTime={{
            showSecond: false,
          }}
          value={dateRange}
          onChange={(s) =>
            setDateRange([
              s![0]!.startOf('minute'),
              s![1]!.endOf('day').endOf('minute'),
            ])
          }
        />
        <Select
          value={deviceId}
          className="w-56"
          options={deviceOptions}
          onChange={setDeviceId}
        />
      </div>
      <div
        className="w-full aspect-video my-3 rounded overflow-hidden"
        style={{ filter: 'lightness(0.5)' }}
      >
        <MapboxMap style={{ width: '100%', height: '100%' }}>
          {tracks && <HistoryTrackChildren tracks={tracks} />}
        </MapboxMap>
      </div>
    </div>
  )
})

HistoryTrack.displayName = 'HistoryTrack'

export default HistoryTrack
