import { getAllDeviceType } from '@/service/modules/device'
import { Skeleton, Tabs } from 'antd'
import SourceTable from './components/SourceTable'
import { useSearchParams } from 'react-router-dom'
import { isNil } from 'lodash'
import { useLangsDict } from '@/store/useDict.store'
import { getDeviceWeight } from '@/enum/device'

type PropsType = unknown

const PageSources: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['allDeviceType'],
      queryFn: () => getAllDeviceType(),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const dict = useLangsDict('device_type')
  const renderItems = useMemo(() => {
    if (!data) {
      return []
    }
    return data
      .map((e) => ({
        label: dict[e.type] ?? e.name,
        value: e.type,
      }))
      .sort((a, b) => getDeviceWeight(a.value) - getDeviceWeight(b.value))
  }, [data, dict])

  // 如果不存在 type, 默认选中第一个
  useEffect(() => {
    if (!searchParams.get('type') && renderItems[0]) {
      setSearchParams({ type: renderItems[0].value })
    }
  }, [renderItems])

  return (
    <div className="page-full p-3 bg-ground-2 flex flex-col overflow-y-hidden">
      <h2 className="text-white">{t('resource.title')}</h2>
      <div>
        {isLoading || !data ? (
          <div className="w-64">
            <Skeleton.Button block className="py-3 h-[42px]" active />
          </div>
        ) : (
          <Tabs
            className="mt-3"
            activeKey={searchParams.get('type') ?? undefined}
            items={renderItems.map((e) => ({
              key: e.value,
              label: e.label,
            }))}
            onChange={(e) => !isNil(e) && setSearchParams({ type: e })}
          />
        )}
      </div>
      <SourceTable />
    </div>
  )
})

PageSources.displayName = 'PageSources'

export default PageSources
