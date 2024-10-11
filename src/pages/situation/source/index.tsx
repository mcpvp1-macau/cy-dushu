import { Input } from 'antd'
import SourceStatusCheckGroup from './components/SourceStatusCheckGroup'
import { getDeviceTree } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
import SourceTree from './components/SourceTree'

type PropsType = unknown

const PageSituationSource: FC<PropsType> = memo(() => {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const params = useParams()
  const { sourceType } = params

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['deviceTreeList', sourceType, name],
      queryFn: () =>
        getDeviceTree({
          name: name || undefined,
          type: sourceType,
        }),
      select: (data) => data?.data,
    },
    qc,
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 mt-3">
        <Input
          placeholder="请根据名称搜索"
          onPressEnter={(e) => setName(e.currentTarget.value)}
        />
      </div>
      <SourceStatusCheckGroup className="px-3 my-2" />
      <div className="flex-grow overflow-hidden">
        {isLoading || !data ? (
          <AppSpin />
        ) : (
          <SourceTree data={data} isLoading={isRefetching} />
        )}
      </div>
    </div>
  )
})

PageSituationSource.displayName = 'PageSituationSource'

export default PageSituationSource
