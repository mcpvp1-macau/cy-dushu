import { getAllDeviceType } from '@/service/modules/device'
import { Segmented, Skeleton } from 'antd'
import { memo, type FC } from 'react'
import SourceTable from './components/SourceTable'
import { useSearchParams } from 'react-router-dom'
import DeviceIcon from '@/components/device/DeviceIcon'
import { isNil } from 'lodash'

type PropsType = unknown

const PageSources: FC<PropsType> = memo(() => {
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

  // 如果不存在 type, 默认选中第一个
  useEffect(() => {
    if (!searchParams.get('type') && data?.at(0)) {
      setSearchParams({ type: data.at(0)!.type })
    }
  }, [data])

  return (
    <div className="page-full p-3 bg-ground-180 flex flex-col overflow-y-hidden">
      <h2 className="text-white">资源</h2>
      <div>
        {isLoading || !data ? (
          <div className="w-64">
            <Skeleton.Button block className="py-3 h-[42px]" active />
          </div>
        ) : (
          <Segmented
            className="mt-3"
            value={searchParams.get('type')}
            options={data.map((e) => ({
              label: e.name,
              value: e.type,
              icon: <DeviceIcon type={e.type} />,
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
