import AppSpin from '@/components/AppSpin'
import { getAlgorithmList } from '@/service/modules/algorithm'
import { memo, type FC } from 'react'
import AlgorithmListItem from './AlgorithmListItem'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type PropsType = {
  productKey: string
  deviceId: string
  deviceType: string
}

/** 设备 AI 列表 */
const DeviceAlgorithmList: FC<PropsType> = memo(
  ({ productKey, deviceId, deviceType }) => {
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery(
      {
        queryKey: ['algorithmList', deviceType, deviceId],
        queryFn: () => getAlgorithmList({ deviceId, deviceType: [deviceType] }),
        select: (d) => d.data.rows,
        refetchInterval: 10_000,
      },
      queryClient,
    )

    const handleAction = useMemoizedFn(() =>
      queryClient.invalidateQueries({
        queryKey: ['algorithmList', deviceType, deviceId],
      }),
    )

    if (isLoading || !data) {
      return <AppSpin className="p-3" />
    }

    return (
      <ScrollArea>
        <div className="p-3 pr-[9px] flex flex-col gap-3 min-w-[320px]">
          {data.map((item) => (
            <AlgorithmListItem
              key={item.id}
              aiData={item}
              deviceId={deviceId}
              productKey={productKey}
              onAction={handleAction}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  },
)

DeviceAlgorithmList.displayName = 'UavDetailAlgorithmList'

export default DeviceAlgorithmList
