import { Flex, List } from 'antd'
import VirtualList from 'rc-virtual-list'
import WanglouTarget from './WanglouTarget'
import {
  getEventDataTargetList,
  targetListEnumDict,
} from '@/service/modules/db-api'
import Filter from '../Filter/index'
import { GroupType } from '@/components/Filter/FilterPopover/interface'

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

  const { data: filterData, refetch: getTypes } = useQuery(
    {
      queryKey: ['targetListEnumDict'],
      queryFn: () =>
        targetListEnumDict({
          startTime: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          parentId: deviceId,
        }).then((res) => {
          const { success, data } = res
          // debugger;

          if (success) {
            return {
              sourceTypes: data?.[1] || [],
              targetTypes: data?.[0] || [],
            }
          }
          return {
            sourceTypes: [],
            targetTypes: [],
          }
        }),
      select: (d) => d,
    },
    queryClient,
  )

  const [params, setParams] = useState({
    sourceType: [],
    objectLabel: [],
    targetId: undefined,
  })

  const {
    data = [],
    isLoading,
    // refetch,
  } = useQuery(
    {
      queryKey: [
        'eventDataTargetList',
        deviceId,
        params.sourceType,
        params.objectLabel,
        params.targetId,
      ],
      queryFn: () =>
        getEventDataTargetList({
          // sourceType: [],
          deviceId: deviceId,
          // objectLabel: [],
          ...params,
          startTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }).then((res) => {
          getTypes()
          return res
        }),
      select: (d) => d.data,
      refetchInterval: 10_000,
    },
    queryClient,
  )

  const onChange = useMemoizedFn((values) => {
    const { search, ...data } = values
    setParams({ deviceId, ...data, targetId: search })
    // refetch({ deviceId, ...data, targetId: search });
  })

  return (
    <Flex vertical gap={12}>
      <div>
        <Filter
          onChange={onChange}
          items={[
            {
              type: 'input',
              placeholder: '请输入 ID',
              name: 'search',
            },
          ]}
          popover={{
            title: '目标筛选',
            props: {
              placement: 'topLeft',
            },
            groups: [
              {
                label: '数据来源',
                name: 'sourceType',
                type: GroupType.CheckboxGroup,
                items: filterData?.sourceTypes || [],
              },
              {
                label: '目标类型',
                name: 'objectLabel',
                type: GroupType.CheckboxGroup,
                items: filterData?.targetTypes || [],
              },
            ],
          }}
        />
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
