import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { dft } from '@/constant/time-fmt'
import { getEventPhotoEnumList, getPlatformCapture } from '@/service/modules/db-api'
import { makePanormaToolbarRender, makeToolbarRender } from '@/utils/antd/image'
import {
  Button,
  Checkbox,
  Col,
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
import IconClose from '@/assets/icons/jsx/IconClose'
import PanoramaViewer from '@/components/ui/PanoramaViewer'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'

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

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])
  const [type, setType] = useState<string>('-1')
  const [deviceId, setDeviceId] = useState<string>(deviceList[0]?.deviceId)

  const queryClient = useQueryClient()
  const { data: eventPhotoEnums = [] } = useQuery(
    {
      queryKey: ['eventPhotoEnumList'],
      queryFn: getEventPhotoEnumList,
      select: (resp) => resp.data ?? [],
    },
    queryClient,
  )

  const defaultPictureSourceTypeOptions = useMemo(
    () => [
      {
        label: t('device.pictureFilter.all.title', {
          defaultValue: '全部',
        }),
        value: '-1',
      },
      {
        label: t('device.pictureFilter.screenshot.title', {
          defaultValue: '截图',
        }),
        value: 'SCREENSHOT',
      },
      {
        label: t('device.pictureFilter.photograph.title', {
          defaultValue: '拍照',
        }),
        value: 'PHOTOGRAPH',
      },
    ],
    [t],
  )

  const pictureSourceTypeOptions = useMemo(() => {
    if (!eventPhotoEnums.length) {
      // 兜底逻辑：枚举接口失败时使用内置选项
      return defaultPictureSourceTypeOptions
    }

    return [...eventPhotoEnums]
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((item) => ({
        label:
          item.value ??
          t('device.pictureFilter.all.title', { defaultValue: '全部' }),
        value: item.key ?? '-1',
      }))
  }, [defaultPictureSourceTypeOptions, eventPhotoEnums, t])

  useEffect(() => {
    if (!pictureSourceTypeOptions.length) {
      return
    }

    // 业务规则：枚举变化时确保筛选值有效
    if (!pictureSourceTypeOptions.some((option) => option.value === type)) {
      setType(pictureSourceTypeOptions[0]?.value ?? '-1')
    }
  }, [pictureSourceTypeOptions, type])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)

  const [pictureType, setPictureType] = useState<string[]>([])

  const { data, isLoading } = useQuery(
    {
      queryKey: [
        'getPlatformCapture',
        'PICTURE',
        deviceId,
        type,
        pictureType?.join(',') || 'ALL',
        `${dateRange?.[0].unix()}-${dateRange?.[1].unix()}`,
        page,
        pageSize,
      ],
      queryFn: () =>
        getPlatformCapture({
          deviceId,
          type: 'PICTURE',
          sourceId: type,
          photoType: pictureType.length > 0 ? pictureType : undefined,
          startTime: dateRange![0].format(dft),
          endTime: dateRange![1].format(dft),
          isPage: true,
          page,
          pageSize,
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

  const [usePanorama, setUsePanorama] = useState(false)
  const handleCheckImage = async (url: string) => {
    try {
      // 获取图像数据
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch image')
      const arrayBuffer = await response.arrayBuffer()
      const data = new Uint8Array(arrayBuffer)

      // 查找 XMP 数据块
      const text = new TextDecoder().decode(data)
      setUsePanorama(text.includes('GPano:UsePanoramaViewer="True"'))
    } catch (_e) {}
  }

  const pictureTypeOptions = useMemo(
    () => [
      {
        label: '可见光',
        value: '可见光',
      },
      {
        label: '广角',
        value: '广角',
      },
      {
        label: '变焦',
        value: '变焦',
      },
      {
        label: '红外',
        value: '红外',
      },
    ],
    [],
  )

  return (
    <div>
      <div className="py-3 flex gap-3">
        <DateRangePicker
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
          className="w-40"
          options={deviceOptions}
          onChange={setDeviceId}
        />
        <Select
          className="w-20"
          value={type}
          options={pictureSourceTypeOptions}
          onChange={setType}
        />
        <Select
          className="w-44"
          mode="multiple"
          placeholder={t('common.all')}
          value={pictureType}
          allowClear
          maxTagCount="responsive"
          style={{ minWidth: 120 }}
          options={pictureTypeOptions}
          onChange={setPictureType}
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
                <Checkbox.Group
                  className="w-full"
                  value={checkedIds}
                  onChange={setCheckedIds}
                >
                  <Image.PreviewGroup
                    preview={{
                      destroyOnClose: true,
                      closeIcon: <IconClose className="scale-125" />,
                      imageRender: (e, info) => {
                        handleCheckImage(info.image.url)

                        if (usePanorama) {
                          return (
                            <div className="absolute inset-0">
                              <PanoramaViewer src={info.image.url} />
                            </div>
                          )
                        }

                        return e
                      },
                      toolbarRender: usePanorama
                        ? makePanormaToolbarRender()
                        : makeToolbarRender(1, 50),
                    }}
                  >
                    <Row className="w-full" gutter={[12, 12]}>
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
                pageSize={pageSize}
                total={total?.[0].cnt}
                pageSizeOptions={[24, 48, 96]}
                onChange={(page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
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
