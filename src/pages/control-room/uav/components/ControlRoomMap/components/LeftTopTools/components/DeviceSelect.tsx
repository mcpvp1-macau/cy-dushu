import { DeviceEnum } from '@/enum/device'
import { getDeviceTree } from '@/service/modules/device'
import { ScrollArea } from '@/components/ui/scroll-area'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import SourceTree from '@/pages/situation/source/components/SourceTree'
import AppSpin from '@/components/AppSpin'
import { Input } from 'antd'
import SourceStatusCheckGroup from '@/pages/situation/source/components/SourceStatusCheckGroup'

type PropsType = {
  onClose?: () => void
}

const DeviceSelect: FC<PropsType> = memo(({ onClose }) => {
  const { t } = useTranslation()

  const [name, setName] = useState('')

  const qc = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['deviceTreeList', DeviceEnum.UAV, name],
      queryFn: () =>
        getDeviceTree({
          type: DeviceEnum.UAV,
          name: name || undefined,
        }),
      select: (data) => data?.data,
    },
    qc,
  )

  const navigate = useNavigate()
  const handleClick = useMemoizedFn((data: API_DEVICE.domain.Device) => {
    navigate(`/control-room/uav/${data.deviceId}`)
  })

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
          onPressEnter={(e) => setName(e.currentTarget.value)}
        />
      </div>
      <SourceStatusCheckGroup className="px-3 my-2" />
      <ScrollArea className="flex-1">
        {data ? (
          <SourceTree
            isLoading={isLoading || isRefetching}
            data={data}
            onDeviceItemClick={handleClick}
          />
        ) : (
          <AppSpin />
        )}
      </ScrollArea>
    </div>
  )
})

DeviceSelect.displayName = 'DeviceSelect'

export default DeviceSelect
