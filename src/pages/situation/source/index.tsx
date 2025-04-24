import { Input } from 'antd'
import SourceStatusCheckGroup from './components/SourceStatusCheckGroup'
import { getDeviceTree } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
import SourceTree from './components/SourceTree'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

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

  const { t } = useTranslation()

  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const handleClick = useMemoizedFn((data) => {
    updateRightMode(RightModeEnum.DEVICE)
    updateDetailId(data.deviceId)
  })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 mt-3">
        <Input
          placeholder={t('source.input.placeholder')}
          onPressEnter={(e) => setName(e.currentTarget.value)}
        />
      </div>
      <SourceStatusCheckGroup className="px-3 my-2" />
      <div className="flex-grow overflow-hidden">
        {isLoading || !data ? (
          <AppSpin />
        ) : (
          <SourceTree
            data={data}
            isLoading={isRefetching}
            onDeviceItemClick={handleClick}
          />
        )}
      </div>
    </div>
  )
})

PageSituationSource.displayName = 'PageSituationSource'

export default PageSituationSource
