import IconClose from '@/assets/icons/jsx/IconClose'
import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import PanoramaViewer from '@/components/ui/PanoramaViewer'
import { dft, timeOnly } from '@/constant/time-fmt'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import { getPlatformCapture } from '@/service/modules/db-api'
import useMediaOnMapStore from '@/store/map/useMediaOnMap.store'
import { makePanormaToolbarRender, makeToolbarRender } from '@/utils/antd/image'
import { Pagination, Spin, Image, Row, Col } from 'antd'
import { v4 } from 'uuid'

type PropsType = {
  actionId: string
  enablePictureOnMap?: boolean
}

const ActionMediaPicture: FC<PropsType> = memo(
  ({ actionId, enablePictureOnMap }) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(9)

    const queryClient = useQueryClient()
    const { data, isLoading, isRefetching } = useQuery(
      {
        queryKey: ['actionMediaPicture', actionId, page, pageSize],
        queryFn: () =>
          getPlatformCapture({
            actionId,
            type: 'PICTURE',
            isPage: true,
            page,
            pageSize,
          }),
        select: (d) => d.data,
      },
      queryClient,
    )

    // 照片上图 -------------------------------------------------------------------
    const id = useMemo(() => v4(), [])

    useEffect(() => {
      if (!data?.[0]?.length || !enablePictureOnMap) {
        return
      }
      const store = useMediaOnMapStore.getState()
      store.updateMediaGroup({
        ...store.mediaGroup,
        [id]: data[0].filter((e) => e.longitude && e.latitude),
      })
    }, [data, id, enablePictureOnMap])

    // 清空
    useEffect(() => {
      return () => {
        const store = useMediaOnMapStore.getState()
        if (!store.mediaGroup[id]) {
          return
        }
        const next = { ...store.mediaGroup }
        delete next[id]
        store.updateMediaGroup(next)
      }
    }, [id, enablePictureOnMap])

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

    return (
      <>
        {isLoading || !data ? (
          <AppSpin />
        ) : data[1]?.[0]?.cnt === 0 || !data[0]?.length ? (
          <AppEmpty />
        ) : (
          <div className="m-3">
            <Spin spinning={isRefetching}>
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

                    return (
                      <>
                        <div
                          className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-fore text-base flex gap-3"
                          style={{
                            textShadow: '0 0 1px rgba(0, 0, 0, 0.8)',
                          }}
                        >
                          <p>{data[0][info.current].sourceName}</p>
                          <p>
                            {dayjs(data[0][info.current].startTime).format(dft)}
                          </p>
                        </div>
                        {e}
                      </>
                    )
                  },
                  toolbarRender: usePanorama
                    ? makePanormaToolbarRender()
                    : makeToolbarRender(1, 50),
                }}
              >
                <Row className="mt-3" gutter={[8, 8]}>
                  {data[0].map((e) => (
                    <Col key={e.id} span={8}>
                      <div className="relative w-full aspect-[4_/_3]">
                        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
                          <p className="text-xs p-1 py-0.5 bg-ground-1 bg-opacity-60">
                            {dayjs(e.startTime).format(timeOnly)}
                          </p>
                        </div>
                        <Image
                          width="100%"
                          height="100%"
                          loading="lazy"
                          className="block size-full object-cover"
                          src={handleStorageURL(e.url)}
                          alt={e.url.slice(e.url.lastIndexOf('/') + 1)}
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
                pageSizeOptions={Array.from(
                  { length: 8 },
                  (_, i) => (i + 1) * 9,
                )}
                onChange={(page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
                }}
              />
            </div>
          </div>
        )}
      </>
    )
  },
)

ActionMediaPicture.displayName = 'ActionMediaPicture'

export default ActionMediaPicture
