import AppSpin from '@/components/AppSpin'
import { getAlgorithmList } from '@/service/modules/algorithm'
import AlgorithmListItem from './AlgorithmListItem'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import AppEmpty from '@/components/AppEmpty'
import { Input } from 'antd'
import Select from '@/components/AntdOverride/Select'

type PropsType = {
  productKey: string
  deviceId: string
  deviceType: string
}

/** 设备 AI 列表 */
const DeviceAlgorithmList: FC<PropsType> = memo(
  ({ productKey, deviceId, deviceType }) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    const { data, isLoading } = useQuery(
      {
        queryKey: ['algorithmList', deviceType, deviceId],
        queryFn: () => getAlgorithmList({ deviceId, deviceType: [deviceType] }),
        select: (d) => d.data.rows,
        refetchInterval: 10_000,
      },
      queryClient,
    )

    const [searchValue, setSearchValue] = useState('')
    const [filterImageType, setFilterImageType] = useState<string | undefined>(
      undefined,
    )

    const filteredData = useMemo(() => {
      if (!data) return []
      return data.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchValue.toLowerCase())
        const matchesType = filterImageType
          ? item.imageType === filterImageType
          : true
        return matchesSearch && matchesType
      })
    }, [data, searchValue, filterImageType])

    const handleAction = useMemoizedFn(() =>
      queryClient.invalidateQueries({
        queryKey: ['algorithmList', deviceType, deviceId],
      }),
    )

    if (isLoading || !data) {
      return <AppSpin className="p-3" />
    }

    return (
      <ScrollArea>
        <div className="p-3 pr-[9px] flex flex-col gap-3 min-w-[320px]">
          <div>
            <Input
              placeholder={t('poi_searcher.placeholder')}
              allowClear
              addonAfter={
                <div className="px-3">
                  <Select
                    className="w-24"
                    options={[
                      { label: t('common.center'), value: 'CENTER' },
                      { label: t('common.region'), value: 'REGION' },
                    ]}
                    placeholder={t('common.all')}
                    allowClear
                    onChange={setFilterImageType}
                  />
                </div>
              }
              onClear={() => setSearchValue('')}
              onPressEnter={(e) => setSearchValue(e.currentTarget.value)}
            />
          </div>

          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <AlgorithmListItem
                key={item.id}
                aiData={item}
                deviceId={deviceId}
                productKey={productKey}
                onAction={handleAction}
              />
            ))
          ) : (
            <AppEmpty />
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  },
)

DeviceAlgorithmList.displayName = 'UavDetailAlgorithmList'

export default DeviceAlgorithmList
