import IconMinus from '@/assets/icons/jsx/IconMinus'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import Select from '@/components/AntdOverride/Select'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import useAirlineOptions from '@/hooks/device/useAirlineOptions'
import { getAllDeviceListV3 } from '@/service/modules/device'
import { shouldJson } from '@/utils/json'
import { InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Radio,
  TimePicker,
  Tooltip,
} from 'antd'
import type { Dayjs } from 'dayjs'

const TipInfo = memo(() => {
  return (
    <p className="flex gap-2 text-fore">
      <InfoCircleOutlined />
      航线结束动作必须设置为返航
    </p>
  )
})

const SingleFormItems = memo(() => {
  return (
    <Form.Item
      label="执行时间"
      name="executeTime"
      required
      rules={[{ required: true }]}
    >
      <DatePicker className="w-full" showTime />
    </Form.Item>
  )
})

const REPEATFormItems = memo(() => {
  return (
    <>
      <Form.Item
        label="执行日期"
        name="timeRange"
        required
        rules={[{ required: true }]}
      >
        <DatePicker.RangePicker className="w-full" />
      </Form.Item>
      <Form.List name="executeTime">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, ...restField }, i) => (
              <div className="flex gap-2">
                <Form.Item
                  {...restField}
                  className="w-full"
                  label={
                    <span>
                      执行时间{' '}
                      <Tooltip title="重复任务的计划间隔必须设置为至少超过 前一次任务实际执行时长 20 分钟以上">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  key={key}
                  name={restField.name}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject('请选择执行时间')
                        }
                        if (i === 0) {
                          return Promise.resolve()
                        }
                        const prevTime = getFieldValue(['executeTime', i - 1])
                        if (prevTime && value) {
                          const diff = value.diff(prevTime, 'minute')
                          if (value.isBefore(prevTime)) {
                            return Promise.reject(
                              '时间间隔必须大于前一次执行时间',
                            )
                          }
                          if (diff < 120) {
                            return Promise.reject('时间间隔必须大于 2 小时')
                          }
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <TimePicker className="w-full" />
                </Form.Item>
                <div className="mt-[30px] flex gap-2">
                  <Button
                    size="small"
                    className="min-w-[22px] h-[22px]"
                    icon={<IconPlus />}
                    onClick={() => add(undefined, i + 1)}
                  />
                  <Button
                    size="small"
                    className="min-w-[22px] h-[22px]"
                    disabled={fields.length === 1}
                    icon={<IconMinus />}
                    onClick={() => remove(i)}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </Form.List>
    </>
  )
})

type FormValuesType = {
  name: string
  deviceId: string
  airlineIndex: number
  timeRange: Dayjs[]
} & (
  | {
      type: 'SINGLE'
      executeTime: Dayjs
    }
  | {
      type: 'REPEAT'
      executeTime: Dayjs[]
    }
)

type PropsType = {
  data?: API_ACTION_PLAN.domain.Plan
  open?: boolean
  title?: string
  loading?: boolean
  onClose?: () => void
  onConfirm?: (data: API_ACTION_PLAN.domain.Plan) => void
}

const ScheduleModal: FC<PropsType> = memo(
  ({ title = '新建计划', data, open, loading, onClose, onConfirm }) => {
    const { data: airlines, airlineOptions } = useAirlineOptions()

    const [form] = Form.useForm<FormValuesType>()

    const type = Form.useWatch('type', form) ?? data?.type
    useUpdateEffect(() => {
      form.setFieldValue('executeTime', [undefined])
    }, [type])

    const queryClient = useQueryClient()
    const { data: airports } = useQuery(
      {
        queryKey: ['getAllDeviceList', DeviceEnum.UAV],
        queryFn: () =>
          getAllDeviceListV3({
            type: DeviceEnum.UAV,
          }),
        select: (d) => d.data.rows,
        staleTime: Infinity,
      },
      queryClient,
    )

    const uavDevices = useMemo(() => {
      return (airports ?? []).map((e) => ({
        label: e.deviceName,
        value: e.deviceId,
      }))
    }, [airports])

    useEffect(() => {
      if (!open) {
        form.resetFields()
        return
      }
      if (data) {
        form.setFieldsValue({
          name: data.name,
          deviceId: data.actionConfig?.deviceIds,
          airlineIndex: airlines?.findIndex(
            (e) =>
              e.waylineTemplateId === data.actionConfig?.waylineTemplateId ||
              e.templateId === data.actionConfig?.templateId,
          ),

          type: data.type as any,
          timeRange: [dayjs(data.startTime), dayjs(data.endTime)],
        })
        switch (data.type) {
          case 'SINGLE':
            form.setFieldValue(
              'executeTime',
              dayjs(data.startTime)
                .add(dayjs(data.executeTime![0], 'HH:mm:ss').hour(), 'hour')
                .add(dayjs(data.executeTime![0], 'HH:mm:ss').minute(), 'minute')
                .add(
                  dayjs(data.executeTime![0], 'HH:mm:ss').second(),
                  'second',
                ),
            )
            break
          case 'REPEAT':
            form.setFieldValue(
              'executeTime',
              data.executeTime!.map((e) => dayjs(e, 'HH:mm:ss')),
            )
            break
        }
      }
    }, [open])

    const handleConfirm = async () => {
      await form.validateFields()
      const values = form.getFieldsValue()
      const activeAirline = airlines!.at(values.airlineIndex)!
      const parameters = shouldJson(activeAirline!.parameters)
      const submitData: API_ACTION_PLAN.domain.Plan = {
        name: values.name,
        actionConfig: {
          deviceIds: values.deviceId,
          deviceType: DeviceEnum.UAV,
          taskTemplateInfo: {
            parameters,
            taskBasic: activeAirline.taskBasic,
          },
          templateId: activeAirline.templateId,
          waylineTemplateId: activeAirline.waylineTemplateId,
          templateName: activeAirline.taskName,
        },
        type: values.type,
      }
      switch (values.type) {
        case 'SINGLE':
          submitData.startTime = values.executeTime.format(
            'YYYY-MM-DD 00:00:00',
          )
          submitData.endTime = values.executeTime.format('YYYY-MM-DD 23:59:59')
          submitData.executeTime = [values.executeTime.format('HH:mm:ss')]
          break
        case 'REPEAT':
          submitData.startTime = values.timeRange[0].format(
            'YYYY-MM-DD 00:00:00',
          )
          submitData.endTime = values.timeRange[1].format('YYYY-MM-DD 23:59:59')
          submitData.executeTime = values.executeTime.map((e) =>
            e.format('HH:mm:ss'),
          )
          break
      }
      onConfirm?.(submitData)
    }

    return (
      <XModal
        title={
          <p className="flex gap-1.5">
            <PlusCircleOutlined />
            {title}
          </p>
        }
        centered
        width={400}
        open={open}
        confirmLoading={loading}
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <ConfigProvider
          theme={{
            components: {
              Form: {
                labelFontSize: 12,
                verticalLabelMargin: 0,
                verticalLabelPadding: '0 0 4px 0',
              },
            },
          }}
        >
          <Form
            autoComplete="off"
            layout="vertical"
            initialValues={{ type: 'SINGLE' }}
            form={form}
          >
            <Form.Item
              label="计划名称"
              name="name"
              required
              rules={[{ required: true }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="设备"
              name="deviceId"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="请选择"
                showSearch
                optionFilterProp="label"
                options={uavDevices}
              />
            </Form.Item>
            <Form.Item
              label="航线"
              name="airlineIndex"
              required
              rules={[{ required: true }]}
            >
              <Select
                placeholder="请选择"
                showSearch
                optionFilterProp="label"
                options={airlineOptions}
              />
            </Form.Item>
            <Form.Item
              label="计划策略"
              name="type"
              required
              rules={[{ required: true }]}
            >
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                className="w-full flex gap-[1px]"
              >
                <Radio.Button className="flex-1 text-center" value="SINGLE">
                  单次定时
                </Radio.Button>
                <Radio.Button className="flex-1 text-center" value="REPEAT">
                  重复定时
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            {
              {
                SINGLE: <SingleFormItems />,
                REPEAT: <REPEATFormItems />,
              }[type]
            }
            <TipInfo />
          </Form>
        </ConfigProvider>
      </XModal>
    )
  },
)

ScheduleModal.displayName = 'CreateSchedule'

export default ScheduleModal
