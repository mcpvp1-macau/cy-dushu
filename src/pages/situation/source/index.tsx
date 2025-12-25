import { Input } from 'antd'
import SourceStatusCheckGroup from './components/SourceStatusCheckGroup'
import { getDeviceTree, getDeviceTreeV4 } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
import SourceTree from './components/SourceTree'
import SourceTreeV4 from './components/SourceTreeV4'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import { useDebounceFn } from 'ahooks'

type PropsType = unknown
type DeviceTreeResponse = {
  code: string
  message: string
  data: API_DEVICE.res.DeviceTreeRes | API_DEVICE.res.DeviceTreeV4Res
}

const PageSituationSource: FC<PropsType> = memo(() => {
  const qc = useQueryClient()
  const useDeviceTreeV4 = globalConfig.useDeviceTreeV4

  const [name, setName] = useState('')
  const params = useParams()
  const { sourceType } = params

  const { data, isLoading, isRefetching } = useQuery<
    DeviceTreeResponse,
    Error,
    DeviceTreeResponse['data']
  >(
    {
      queryKey: [
        'deviceTreeList',
        sourceType,
        name,
        useDeviceTreeV4 ? 'v4' : 'v3',
      ],
      queryFn: () => {
        const payload = {
          name: name || undefined,
          type: sourceType,
        }

        // 业务规则：根据配置切换设备树版本
        return (useDeviceTreeV4
          ? getDeviceTreeV4(payload)
          : getDeviceTree(payload)) as Promise<DeviceTreeResponse>
      },
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

  const { run: debouncedSetName } = useDebounceFn(
    (v: string) => {
      setName(v)
    },
    { wait: 500 },
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 mt-3">
        <Input
          placeholder={t('source.input.placeholder')}
          allowClear
          onChange={(e) => debouncedSetName(e.target.value)}
        />
      </div>
      <SourceStatusCheckGroup className="px-3 my-2" />
      <div className="flex-grow overflow-hidden">
        {isLoading || !data ? (
          <AppSpin />
        ) : (
          useDeviceTreeV4 ? (
            <SourceTreeV4
              data={data as API_DEVICE.res.DeviceTreeV4Res}
              isLoading={isRefetching}
              onDeviceItemClick={handleClick}
            />
          ) : (
            <SourceTree
              data={data as API_DEVICE.domain.DeviceTreeItem}
              isLoading={isRefetching}
              onDeviceItemClick={handleClick}
            />
          )
        )}
      </div>
    </div>
  )
})

PageSituationSource.displayName = 'PageSituationSource'

export default PageSituationSource
