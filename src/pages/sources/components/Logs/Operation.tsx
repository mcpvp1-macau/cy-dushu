import { FC, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getDeviceCapacityEnum,
  getDeviceOperateLogs,
} from '@/service/modules/db-api'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  Select,
  Table,
  Tag,
} from 'antd'
import * as XLSX from 'xlsx'

const { RangePicker } = DatePicker

type PropsType = {
  deviceId: string
}

const Health: FC<PropsType> = memo(({ deviceId }) => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss'),
  ])
  const [type, setType] = useState<'services' | 'events' | 'all'>('all')
  const [selectedRows, setSelectedRows] = useState<
    API_DBAPI.domain.OperateLog[]
  >([])
  const [searchValue, setSearchValue] = useState('')
  const { data: capacityEnum } = useQuery({
    queryKey: ['getDeviceCapacityEnum', deviceId],
    queryFn: async () => {
      const res = await getDeviceCapacityEnum()
      return res.data
    },
  })

  const capacityEnumMap = useMemo(() => {
    return (
      capacityEnum?.reduce((acc, item) => {
        acc[
          `${item.productKey}-${item.functionType}-${item.functionIdentifier}`
        ] = item.functionName
        return acc
      }, {} as Record<string, string>) || {}
    )
  }, [capacityEnum])

  const { data = [], isLoading } = useQuery({
    queryKey: ['getDeviceOperationLogs', deviceId, dateRange[0], dateRange[1]],
    queryFn: async () => {
      const res = await getDeviceOperateLogs({
        deviceId,
        startTime: dateRange[0],
        endTime: dateRange[1],
      })
      return res.data || []
    },
    enabled: !!dateRange[0] && !!dateRange[1],
  })

  const typeMap = {
    services: '指令',
    events: '事件',
  }

  const getMessageInfo = (item: API_DBAPI.domain.OperateLog) => {
    if (item.type === 'services') {
      return (
        capacityEnumMap[
          `${item.productKey}-${item.type}-${item.method.split('.')[1]}`
        ] || `${item.productKey}-${item.type}-${item.method.split('.')[1]}`
      )
    }
    return item.messageInfo
  }

  const dataSource = useMemo(() => {
    return data
      .filter((item) => {
        if (!type || type === 'all') {
          return true
        }
        return item.type === type
      })

      .map((item) => {
        return {
          ...item,
          messageInfo: getMessageInfo(item),
          type: typeMap[item.type],
        }
      })
      .filter((item) => {
        if (!searchValue) {
          return true
        }
        return item.messageInfo?.includes(searchValue)
      })
  }, [data, capacityEnumMap, type, searchValue])

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'acquireTime',
      width: 100,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 100,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      width: 100,
      render: (text: string) => {
        return <Tag color={text === '指令' ? 'blue' : 'green'}>{text}</Tag>
      },
    },
    {
      title: '内容',
      dataIndex: 'messageInfo',
      width: 200,
    },
  ]
  const handleExport = () => {
    const data = [
      ['操作时间', '操作人', '操作类型', '内容'],
      ...selectedRows.map((item) => [
        dayjs(item.acquireTime).format('YYYY-MM-DD HH:mm:ss'),
        item.operator,
        item.type,
        item.messageInfo,
      ]),
    ]
    // 将数据转换为工作表
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    // 导出文件
    XLSX.writeFile(wb, 'output.xlsx')
  }
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-2">
        <RangePicker
          value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
          onChange={(dates, dateStrings) => {
            if (dates) {
              const [start, end] = dateStrings
              setDateRange([start, end])
            }
          }}
          className="w-[270px]"
        />
        <Select
          value={type}
          options={[
            { label: '指令', value: 'services' },
            { label: '事件', value: 'events' },
            { label: '全部', value: 'all' },
          ]}
          placeholder="请选择操作类型"
          allowClear
          style={{ width: 100 }}
          onChange={(value) => {
            setType(value)
          }}
        />
        <Input
          placeholder="请输入内容"
          value={searchValue}
          style={{ maxWidth: 350 }}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
        />
        <Button
          type="primary"
          onClick={handleExport}
          disabled={selectedRows.length === 0}
        >
          导出
        </Button>
      </div>
      <div>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: '#2E3A46',
                colorBgContainer: '#28323C',
                borderColor: '#23272D',
              },
            },
          }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={isLoading}
            size="small"
            pagination={false}
            rowKey="acquireTime"
            virtual
            scroll={dataSource.length > 0 ? { x: 1000, y: 500 } : undefined}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRows(selectedRows)
              },
              columnWidth: 20,
            }}
          />
        </ConfigProvider>
      </div>
    </div>
  )
})

export default Health
