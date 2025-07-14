import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import usePicutreSourceTypeOptions from '@/constant/options/pictureSourceTypeOptions'
import { dft } from '@/constant/time-fmt'
import { getPlatformCapture } from '@/service/modules/db-api'
import { makeToolbarRender } from '@/utils/antd/image'
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Image,
  Pagination,
  Progress,
  Row,
  Select,
} from 'antd'
import { Dayjs } from 'dayjs'
import { round } from 'lodash'
import {
  CloudDownloadOutlined,
  CopyOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import useBatchDownloadWithZip from '@/hooks/useBatchDownloadWithZip'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import IconButton from '@/components/ui/button/IconButton'
import { useAppMsg } from '@/hooks/useAppMsg'
import useRangePickerPreset from '@/hooks/useRangePickerPreset'

const { RangePicker } = DatePicker

type PropsType = {
  deviceList: API_DEVICE.domain.Device[]
}

const PictureData: FC<PropsType> = memo(({ deviceList }) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

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

  const [checkedIds, setCheckedIds] = useState<number[]>([])

  const { downloading, downloadedCnt, totalCnt, startDownload } =
    useBatchDownloadWithZip()

  const handleBatchDownload = async () => {
    if (!Array.isArray(records)) {
      return
    }
    const set = new Set(checkedIds)
    await startDownload(
      records.filter((e) => set.has(e.id)).map((e) => handleStorageURL(e.url)),
      `一堆图片${dayjs().format('YYYYMMDDHHmm')}`,
    )
  }

  const presets = useRangePickerPreset()

  return (
    <div>
      <div className="py-3 flex gap-3">
        <RangePicker
          value={dateRange}
          presets={presets}
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
            <div className="mb-2 flex">
              <Checkbox
                indeterminate={
                  checkedIds.length > 0 && checkedIds.length < records.length
                }
                checked={checkedIds.length === records.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedIds(records.map((r) => r.id))
                  } else {
                    setCheckedIds([])
                  }
                }}
              >
                {t('media.photoSelectCountMsg', {
                  count: checkedIds.length,
                })}
              </Checkbox>
              <Button
                size="small"
                type="primary"
                disabled={!checkedIds.length}
                loading={downloading}
                icon={<CloudDownloadOutlined />}
                onClick={handleBatchDownload}
              >
                {t('common.batchDownload')}
              </Button>
              {downloading &&
                (downloadedCnt < totalCnt ? (
                  <div className="px-3 flex-1 flex whitespace-nowrap">
                    <Progress
                      className="w-full"
                      percent={Math.floor((downloadedCnt / totalCnt) * 100)}
                    />
                    <span className="ml-2">
                      {t('common.downloadedPictureCount', {
                        count: downloadedCnt,
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2 ml-3">
                    <SyncOutlined spin />
                    {t('media.makingZipMsg')}
                  </div>
                ))}
            </div>
            <ScrollArea className="max-h-[70vh] -mx-3">
              <div className="mx-3">
                <Checkbox.Group value={checkedIds} onChange={setCheckedIds}>
                  <Image.PreviewGroup
                    preview={{ toolbarRender: makeToolbarRender(1, 50) }}
                  >
                    <Row gutter={[12, 12]}>
                      {records.map((e) => (
                        <Col key={e.id} span={24} md={12} lg={8} xxl={6}>
                          <div className="h-24 p-2 flex items-center gap-2 border border-solid border-ground-5 rounded-[3px]">
                            <div className="h-full aspect-[4/3] relative">
                              <Image
                                src={`/storage/${e.url}`}
                                className="h-full aspect-[4/3] object-cover"
                              />
                              <div>
                                <Checkbox
                                  className="absolute left-1 top-1"
                                  value={e.id}
                                />
                              </div>
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
                                  <span>
                                    {round(e.latitude ?? 0, 5) || '-'}
                                  </span>
                                  <IconButton
                                    className="ml-1"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(
                                        `${round(e.longitude ?? 0, 6)}, ${round(
                                          e.latitude ?? 0,
                                          6,
                                        )}`,
                                      )
                                      msgApi.success(t('common.copySuccess'))
                                    }}
                                  >
                                    <CopyOutlined />
                                  </IconButton>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </Checkbox.Group>
              </div>
            </ScrollArea>
            <div className="my-3 flex justify-end">
              <Pagination
                size="small"
                current={page}
                pageSize={24}
                total={total?.[0].cnt}
                showSizeChanger={false}
                onChange={(page) => {
                  setPage(page)
                  setCheckedIds([]) // Reset selection on page change
                }}
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
