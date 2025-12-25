import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { DeviceEnum } from '@/enum/device'
import { getDeviceTree, getDeviceTreeV4 } from '@/service/modules/device'
import SourceTree from '@/pages/situation/source/components/SourceTree'
import SourceTreeV4 from '@/pages/situation/source/components/SourceTreeV4'
import AppSpin from '@/components/AppSpin'
import { Input } from 'antd'
import SourceStatusCheckGroup from '@/pages/situation/source/components/SourceStatusCheckGroup'
import { useDebounceFn } from 'ahooks'

type PropsType = {
  onClose?: () => void
}
type DeviceTreeResponse = {
  code: string
  message: string
  data: API_DEVICE.res.DeviceTreeRes | API_DEVICE.res.DeviceTreeV4Res
}

const DeviceSelect: FC<PropsType> = memo(({ onClose }) => {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const useDeviceTreeV4 = globalConfig.useDeviceTreeV4

  const qc = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery<
    DeviceTreeResponse,
    Error,
    DeviceTreeResponse['data']
  >(
    {
      queryKey: [
        'deviceTreeList',
        DeviceEnum.ROBOT_DOG,
        name,
        useDeviceTreeV4 ? 'v4' : 'v3',
      ],
      queryFn: () => {
        const payload = {
          type: DeviceEnum.ROBOT_DOG,
          name: name || undefined,
        }

        // 业务规则：根据配置切换 V4 设备树接口
        return (useDeviceTreeV4
          ? getDeviceTreeV4(payload)
          : getDeviceTree(payload)) as Promise<DeviceTreeResponse>
      },
      select: (data) => data?.data,
    },
    qc,
  )

  const navigate = useNavigate()
  const handleClick = useMemoizedFn((data: API_DEVICE.domain.Device) => {
    navigate(`/control-room/rebot-dog/${data.deviceId}`, { replace: true })
  })

  const { run: debouncedSetName } = useDebounceFn(
    (value: string) => {
      setName(value)
    },
    { wait: 500 },
  )

  return (
    <div className="flex-1 flex flex-col rounded overflow-hidden">
      <div className="flex justify-between items-center px-3 py-1 border-b border-ground-5 mb-1 text-sm">
        <p className="text-base">设备选择</p>
        <div>
          <IconButton className="text-lg" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>
      </div>
      <div className="px-3 mt-2">
        <Input
          placeholder={t('source.input.placeholder')}
          onChange={(e) => debouncedSetName(e.currentTarget.value)}
        />
      </div>
      <SourceStatusCheckGroup className="px-3 my-2" />
      <div className="flex-1 overflow-hidden">
        {data ? (
          useDeviceTreeV4 ? (
            <SourceTreeV4
              isLoading={isLoading || isRefetching}
              data={data as API_DEVICE.res.DeviceTreeV4Res}
              onDeviceItemClick={handleClick}
            />
          ) : (
            <SourceTree
              isLoading={isLoading || isRefetching}
              data={data as API_DEVICE.domain.DeviceTreeItem}
              onDeviceItemClick={handleClick}
            />
          )
        ) : (
          <AppSpin />
        )}
      </div>
    </div>
  )
})

DeviceSelect.displayName = 'DeviceSelect'

export default DeviceSelect
