import { Flex, List } from 'antd'
import VirtualList from 'rc-virtual-list'
import WanglouTarget from './WanglouTarget'
import { getEventDataTargetList } from '@/service/modules/db-api'

type PropsType = {
  deviceId: string
  deviceType: string
  height?: number
}

/**
 * 检测数据
 * @returns
 */
const AiData: React.FC<PropsType> = ({ deviceId, height = 500 }) => {
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery(
    {
      queryKey: ['eventDataTargetList', deviceId],
      queryFn: () =>
        getEventDataTargetList({
          sourceType: [],
          deviceId: deviceId,
          startTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          objectLabel: [],
        }),
      select: (d) => d.data,
      refetchInterval: 10_000,
    },
    queryClient,
  )

  return (
    <Flex vertical gap={12}>
      <div>
        <List loading={isLoading}>
          <VirtualList
            data={data}
            height={data.length * 112}
            itemHeight={112}
            itemKey={'id'}
          >
            {(item) => <WanglouTarget data={item} />}
          </VirtualList>
        </List>
      </div>
    </Flex>
  )
}

export default AiData
