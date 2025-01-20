import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import { DeviceEnum } from '@/enum/device'
import useWatch from '@/hooks/useWatch'
import { getAllDeviceType } from '@/service/modules/device'

const deviceWeight = new Map<string, number>([
  [DeviceEnum.UAV, 1],
  [DeviceEnum.UAV_AIRPORT, 10],
  [DeviceEnum.WANGLOU, 100],
  [DeviceEnum.CAMERA, 10000],
  [DeviceEnum.SITE_ENFORCEMENT_RECORDER, 100000],
])

const getDeviceWeight = (type: string) =>
  deviceWeight.get(type) ?? Number.MAX_VALUE / 2

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

  useWatch(
    data,
    (val) => {
      if (!value && val?.length) {
        queueMicrotask(() => onChange?.(val[0].type))
      }
    },
    true,
  )

  const renderItems = useMemo(() => {
    if (!data) {
      return []
    }
    return data
      .map((e) => ({
        label: e.name,
        value: e.type,
      }))
      .sort((a, b) => getDeviceWeight(a.value) - getDeviceWeight(b.value))
  }, [data])

  const handleSourceTypeChange = useMemoizedFn((type: string) => {
    onChange?.(type)
  })

  return (
    <Select
      loading={isLoading}
      // className="w-fit"
      variant="borderless"
      popupMatchSelectWidth={false}
      labelRender={(e) => (
        <div className="flex gap-2">
          {/** @ts-ignore */}
          <DeviceIcon type={e.value} />
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
