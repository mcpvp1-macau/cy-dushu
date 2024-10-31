import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import useWatch from '@/hooks/useWatch'
import { getAllDeviceType } from '@/service/modules/device'
import { memo, type FC } from 'react'

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
      options={data?.map((e) => ({
        label: e.name,
        value: e.type,
      }))}
      value={value}
      onChange={handleSourceTypeChange}
    />
  )
})

SourceTypeSelect.displayName = 'SourceTypeSelect'

export default SourceTypeSelect
