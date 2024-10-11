import Select from '@/components/AntdOverride/Select'
import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { pictureSourceTypeOptions } from '@/constant/options/device-media'
import { beginDay, dft, timeOnly } from '@/constant/time-fmt'
import { getPlatformCapture } from '@/service/modules/db-api'
import { Col, Image, Pagination, Row, Spin } from 'antd'

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

const pageSize = 9

const DeviceDetailMediaDataPicture: FC<PropsType> = memo(({ deviceList }) => {
  const [mode, setMode] = useState('ALL')

  const deviceOptions = useMemo(
    () =>
      deviceList.map((e) => ({
        label: e.name,
        value: e.deviceId,
      })),
    deviceList,
  )

  const [deviceId, setDeviceId] = useState(deviceList[0]?.deviceId)
  useEffect(() => {
    setDeviceId(deviceList[0]?.deviceId)
  }, [deviceOptions])

  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: [
        'getPlatformCapture',
        'PICTURE',
        mode,
        deviceId,
        'today',
        page,
      ],
      queryFn: () =>
        getPlatformCapture({
          deviceId,
          type: 'PICTURE',
          sourceId: mode,
          startTime: dayjs().format(beginDay),
          endTime: dayjs().format(dft),
          page,
          pageSize,
        }),
      select: (d) => d.data,
    },
    queryClient,
  )

  return (
    <div className="p-3">
      <section className="flex gap-2">
        <Select
          className="grow"
          value={mode}
          options={pictureSourceTypeOptions}
          onChange={setMode}
        />
        <Select
          className="grow"
          value={deviceId}
          options={deviceOptions}
          onChange={setDeviceId}
        />
      </section>
      {isLoading || !data ? (
        <AppSpin />
      ) : data[1]?.[0]?.cnt === 0 || !data[0]?.length ? (
        <AppEmpty />
      ) : (
        <div>
          <Spin spinning={isRefetching}>
            <Image.PreviewGroup>
              <Row className="mt-3" gutter={[8, 8]}>
                {data[0].map((e) => (
                  <Col key={e.id} span={8}>
                    <div className="relative w-full aspect-[4_/_3]">
                      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
                        <p className="text-xs p-1 py-0.5 bg-ground-100 bg-opacity-60">
                          {dayjs(e.startTime).format(timeOnly)}
                        </p>
                      </div>
                      <Image
                        width="100%"
                        height="100%"
                        loading="lazy"
                        className="block size-full object-cover"
                        src={`/storage/${e.url}`}
                        preview={{ destroyOnClose: true }}
                        alt=""
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>
          </Spin>
          <div className="mt-1 flex justify-center">
            <Pagination
              size="small"
              current={page}
              pageSize={pageSize}
              total={data[1]?.[0]?.cnt}
              onChange={(page) => setPage(page)}
            />
          </div>
        </div>
      )}
    </div>
  )
})

DeviceDetailMediaDataPicture.displayName = 'UavDetailMediaDataPicture'

export default DeviceDetailMediaDataPicture
