import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import { DeviceEnum, getDeviceWeight } from '@/enum/device'
import useWatch from '@/hooks/useWatch'
import { getAllDeviceType } from '@/service/modules/device'
import { useLangsDict } from '@/store/useDict.store'

type PropsType = {
  value: string
  onChange?: (value: string) => void
}

const SourceTypeSelect: FC<PropsType> = memo(({ value, onChange }) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['allDeviceType'],
      queryFn: getAllDeviceType,
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

  useWatch(
    renderItems,
    (val) => {
      if (!value && val?.length) {
        queueMicrotask(() => onChange?.(val[0].value))
      }
    },
    true,
  )

  const handleSourceTypeChange = useMemoizedFn((type: string) => {
    onChange?.(type)
  })

  return (
    <Select
      loading={isLoading}
      variant="borderless"
      popupMatchSelectWidth={false}
      labelRender={(e) => (
        <div className="flex gap-2">
          <DeviceIcon type={e.value as DeviceEnum} />
          {e.label}
        </div>
      )}
      options={renderItems}
      value={value}
      onChange={handleSourceTypeChange}
    />
  )
})

SourceTypeSelect.displayName = 'SourceTypeSelect'

export default SourceTypeSelect
