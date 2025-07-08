import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import usePicutreSourceTypeOptions from '@/constant/options/pictureSourceTypeOptions'
import { dft } from '@/constant/time-fmt'
import { getPlatformCapture } from '@/service/modules/db-api'
import { makeToolbarRender } from '@/utils/antd/image'
import { Col, DatePicker, Image, Pagination, Row, Select } from 'antd'
import { Dayjs } from 'dayjs'
import { round } from 'lodash'

const { RangePicker } = DatePicker

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

const PictureData: FC<PropsType> = memo(({ deviceList }) => {
  const { t } = useTranslation()
  const deviceOptions = useMemo(
    () =>
      deviceList.map((e) => ({
        label: e.name,
        value: e.deviceId,
      })),
    deviceList,
  )

  const pictureSourceTypeOptions = usePicutreSourceTypeOptions()

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])
  const [type, setType] = useState('ALL')
  const [deviceId, setDeviceId] = useState<string>(deviceList[0]?.deviceId)

  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery(
    {
      queryKey: [
        'getPlatformCapture',
        'PICTURE',
        deviceId,
        type,
        `${dateRange?.[0].unix()}-${dateRange?.[1].unix()}`,
        page,
      ],
      queryFn: () =>
        getPlatformCapture({
          deviceId,
          type: 'PICTURE',
          sourceId: type,
          startTime: dateRange![0].format(dft),
          endTime: dateRange![1].format(dft),
          isPage: true,
          page,
          pageSize: 24,
        }),
      enabled: !!deviceId && !!dateRange,
      select: (d) => d.data,
    },

    queryClient,
  )

  const records = data?.[0] ?? 0
  const total = data?.[1]

  return (
    <div>
      <div className="py-3 flex gap-3">
        <RangePicker
          value={dateRange}
          onChange={(s) => {
            if (!s) {
              setDateRange(null)
            } else {
              setDateRange([s![0]!, s![1]!.endOf('day')])
            }
          }}
        />
        <Select
          value={deviceId}
          className="w-56"
          options={deviceOptions}
          onChange={setDeviceId}
        />
        <Select
          className="w-20"
          value={type}
          options={pictureSourceTypeOptions}
          onChange={setType}
        />
      </div>
      <div>
        {isLoading ? (
          <AppSpin />
        ) : !records || total?.[0].cnt === 0 || records.length === 0 ? (
          <AppEmpty className="my-10" />
        ) : (
          <>
            <ScrollArea className="max-h-[70vh] -mx-3">
              <div className="mx-3">
                <Image.PreviewGroup
                  preview={{ toolbarRender: makeToolbarRender(1, 50) }}
                >
                  <Row gutter={[12, 12]}>
                    {records.map((e) => (
                      <Col key={e.id} span={24} md={12} lg={8} xxl={6}>
                        <div className="h-24 p-2 flex items-center gap-2 border border-solid border-ground-5 rounded-[3px]">
                          <div className="h-full aspect-[4/3]">
                            <Image
                              src={`/storage/${e.url}`}
                              className="h-full aspect-[4/3] object-cover"
                            />
                          </div>
                          <div className="h-full flex flex-col justify-between text-xs">
                            <p>
                              <span>{t('common.time')}: </span>
                              {e.startTime}
                            </p>
                            <p>
                              <span>{t('common.type')}: </span>
                              {e.type === 'PICTURE'
                                ? t('device.pictureFilter.photograph.title')
                                : t('device.pictureFilter.screenshot.title')}
                            </p>
                            <div className="flex whitespace-nowrap">
                              <p className="flex-1">
                                <span>{t('common.position')}: </span>
                                <span>
                                  {round(e.longitude ?? 0, 5) || '-'},{' '}
                                </span>
                                <span>{round(e.latitude ?? 0, 5) || '-'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            </ScrollArea>
            <div className="my-3 flex justify-end">
              <Pagination
                size="small"
                pageSize={10}
                current={page}
                total={total?.[0].cnt}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
})

PictureData.displayName = 'PictureData'

export default PictureData
