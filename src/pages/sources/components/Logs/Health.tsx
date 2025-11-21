import { FC, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDeviceHealthLogs } from '@/service/modules/db-api'
import { Button, ConfigProvider, Table, Tooltip } from 'antd'
import * as XLSX from 'xlsx'
import { HealthInfo } from '@/components/device/HealthInfoList'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'

type PropsType = {
  deviceId: string
}

const Health: FC<PropsType> = memo(({ deviceId }) => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss'),
  ])
  const [selectedRows, setSelectedRows] = useState<
    API_DBAPI.domain.HealthLog[]
  >([])

  const { data = [], isLoading } = useQuery({
    queryKey: ['getDeviceHealthLogs', deviceId, dateRange[0], dateRange[1]],
    queryFn: async () => {
      const res = await getDeviceHealthLogs({
        deviceId,
        startTime: dateRange[0],
        endTime: dateRange[1],
      })
      return res.data || []
    },
    enabled: !!dateRange[0] && !!dateRange[1],
  })

  const columns = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 100,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 100,
    },
    {
      title: '内容',
      dataIndex: 'messageInfo',
      width: 200,
      render: (text: string) => {
        return (
          <Tooltip title={text}>
            <div className="text-ellipsis overflow-hidden whitespace-nowrap">
              <HealthInfo data={text} />
            </div>
          </Tooltip>
        )
      },
    },
  ]
  const handleExport = () => {
    const data = [
      ['开始时间', '结束时间', '内容'],
      ...selectedRows.map((item) => [
        dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
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
        <DateRangePicker
          value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
          onChange={(dates, dateStrings) => {
            if (dates) {
              const [start, end] = dateStrings
              setDateRange([start, end])
            }
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
            dataSource={data}
            columns={columns}
            loading={isLoading}
            size="small"
            pagination={false}
            rowKey="startTime"
            virtual
            scroll={{ x: 'max-content', y: 500 }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRows(selectedRows)
              },
              columnWidth: 20,
            }}
            bordered
          />
        </ConfigProvider>
      </div>
    </div>
  )
})

export default Health
