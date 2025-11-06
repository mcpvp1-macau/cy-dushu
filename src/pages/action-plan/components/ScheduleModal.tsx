import IconMinus from '@/assets/icons/jsx/IconMinus'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import Select from '@/components/AntdOverride/Select'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import useAirlineOptions from '@/hooks/device/useAirlineOptions'
import { shouldJson } from '@/utils/json'
import { InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Switch,
  TimePicker,
  Tooltip,
} from 'antd'
import useFormInstance from 'antd/es/form/hooks/useFormInstance'
import type { Dayjs } from 'dayjs'
import DayOfMonthCheckboxGroup from './DayOfMonthCheckboxGroup'
import DayOfWeekCheckboxGroup from './DayOfWeekCheckboxGroup'
import { ScrollArea } from '@/components/ui/scroll-area'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'
import { WaylineEnum } from '@/constant/uav/wayline'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import DeviceIcon from '@/components/device/DeviceIcon'

const TipInfo = memo(() => {
  const { t } = useTranslation()

  return (
    <p className="flex gap-2 text-fore">
      <InfoCircleOutlined />
      {t('schedule.tip.mustSetGoHome')}
    </p>
  )
})

const SingleFormItems = memo(() => {
  const { t } = useTranslation()

  return (
    <Form.Item
      label={t('common.executeTime.title')}
      name="executeTime"
      required
      rules={[{ required: true }]}
    >
      <DatePicker className="w-full" showTime />
    </Form.Item>
  )
})

const REPEATFormItems = memo(() => {
  const { t } = useTranslation()
  const form = useFormInstance()
  const intervalType = Form.useWatch(['repeatFrequency', 'intervalType'], form)

  return (
    <>
      <Form.Item
        label={t('common.executeDate.title')}
        name="timeRange"
        required
        rules={[{ required: true }]}
      >
        <DateRangePicker className="w-full" />
      </Form.Item>
      <Form.List name="executeTime">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, ...restField }, i) => (
              <div key={key} className="flex gap-2 items-center">
                <Form.Item
                  {...restField}
                  className="w-full"
                  label={
                    <span>
                      {t('common.executeTime.title')}{' '}
                      <Tooltip
                        title={
                          <p className="text-justify">
                            {t('schedule.tip.20minsInterval')}
                          </p>
                        }
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  name={restField.name}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject(
                            t('schedule.errors.selectTime.msg'),
                          )
                        }
                        if (i === 0) {
                          return Promise.resolve()
                        }
                        const prevTime = getFieldValue(['executeTime', i - 1])
                        if (prevTime && value) {
                          const diff = value.diff(prevTime, 'minute')
                          if (value.isBefore(prevTime)) {
                            return Promise.reject(
                              t('schedule.errors.smallThanThePrevious.msg'),
                            )
                          }
                          if (diff < 10) {
                            return Promise.reject(
                              t('schedule.errors.lessThan.msg'),
                            )
                          }
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <TimePicker className="w-full" />
                </Form.Item>
                <div className="mt-2.5 flex gap-2">
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
      <Form.Item label={t('common.repeatFrequency')}>
        <div className="flex items-center gap-2">
          <span>{t('common.every')}</span>
          <Form.Item
            noStyle
            name={['repeatFrequency', 'intervalValue']}
            initialValue={1}
          >
            <InputNumber className="flex-1" min={1} />
          </Form.Item>
          <Form.Item
            noStyle
            name={['repeatFrequency', 'intervalType']}
            initialValue="DAILY"
          >
            <Select
              className="flex-1"
              options={[
                { label: t('common.month'), value: 'MONTHLY' },
                {
                  label: t('common.week'),
                  value: 'WEEKLY',
                },
                {
                  label: t('common.day'),
                  value: 'DAILY',
                },
              ]}
            />
          </Form.Item>
        </div>
        {intervalType === 'WEEKLY' ? (
          <div className="mt-2">
            <Form.Item noStyle name={['repeatFrequency', 'dayOfWeek']}>
              <DayOfWeekCheckboxGroup />
            </Form.Item>
          </div>
        ) : (
          intervalType === 'MONTHLY' && (
            <div className="mt-2">
              <Form.Item noStyle name={['repeatFrequency', 'dayOfMonth']}>
                <DayOfMonthCheckboxGroup />
              </Form.Item>
            </div>
          )
        )}
      </Form.Item>
    </>
  )
})

type FormValuesType = {
  name: string
  deviceId: string
  airlineIndex: number
  timeRange: Dayjs[]
  breakPointEnable?: boolean
} & (
  | {
      type: 'SINGLE'
      executeTime: Dayjs
    }
  | {
      type: 'REPEAT'
      executeTime: Dayjs[]
      repeatFrequency: {
        intervalValue: number
        intervalType: 'MONTHLY' | 'WEEKLY' | 'DAILY'
        dayOfWeek?: number[]
        dayOfMonth?: number[]
      }
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
  ({ title, data, open, loading, onClose, onConfirm }) => {
    const { t } = useTranslation()
    const { data: airlines, airlineOptions, holder } = useAirlineOptions()

    const [form] = Form.useForm<FormValuesType>()

    const type = Form.useWatch('type', form) ?? data?.type
    useUpdateEffect(() => {
      form.setFieldValue('executeTime', [undefined])
    }, [type])

    const airlineIndex = Form.useWatch('airlineIndex', form)
    const taskType = airlines?.[airlineIndex]?.taskType
    const allDevices = useMapDevicesStore((s) => s.allDevices)
    const deviceOptions = useMemo(() => {
      let list = allDevices

      if (taskType) {
        if (
          [
            WaylineEnum.PointWayline,
            WaylineEnum.AreaWayline,
            WaylineEnum.SwarmWayline,
            'mapping2d', // 第三方
            'mapping3d',
          ].includes(taskType as WaylineEnum)
        ) {
          list = list.filter((e) => e.deviceType === DeviceEnum.UAV)
        } else if (
          [
            WaylineEnum.RebotDogWayline,
            WaylineEnum.PointCloud3DWayline,
          ].includes(taskType as WaylineEnum)
        ) {
          list = list.filter((e) => e.deviceType === DeviceEnum.ROBOT_DOG)
        }
      }

      return list.map((e) => ({
        label: (
          <div className="flex gap-2">
            <DeviceIcon type={e.deviceType} />
            {e.deviceName}
          </div>
        ),
        deviceName: e.deviceName,
        value: e.deviceId,
      }))
    }, [allDevices, taskType])

    // 初始化表单数据 ----------------------------------------------------------------
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
          breakPointEnable: data.breakPointEnable === 'YES',
        })
        switch (data.type) {
          case 'SINGLE':
            form.setFieldValue(
              'executeTime',
              dayjs(data.startTime)
                .startOf('day')
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
            form.setFieldValue(
              ['repeatFrequency', 'intervalValue'],
              data.intervalValue ?? 1,
            )
            form.setFieldValue(
              ['repeatFrequency', 'intervalType'],
              data.cycleType ?? 'DAILY',
            )
            // 设置频率
            if (data.cycleType === 'WEEKLY') {
              form.setFieldValue(
                ['repeatFrequency', 'dayOfWeek'],
                (data.dayOfWeek ?? '').split(',').map((e) => parseInt(e)),
              )
            } else if (data.cycleType === 'MONTHLY') {
              form.setFieldValue(
                ['repeatFrequency', 'dayOfMonth'],
                (data.dayOfMonth ?? '').split(',').map((e) => parseInt(e)),
              )
            }
            break
        }
      }
    }, [open])

    // 提交数据 ---------------------------------------------------------------------
    const handleConfirm = async () => {
      await form.validateFields()
      const values = form.getFieldsValue()
      const activeAirline = airlines!.at(values.airlineIndex)!
      const parameters = shouldJson(activeAirline!.parameters)
      const submitData: API_ACTION_PLAN.domain.Plan = {
        name: values.name,
        actionConfig: {
          deviceIds: values.deviceId,
          deviceNames: deviceOptions.find((e) => e.value === values.deviceId)
            ?.deviceName,
          deviceType: DeviceEnum.UAV,
          taskTemplateInfo: {
            parameters,
            taskBasic: activeAirline.taskBasic,
          },
          templateId: activeAirline.templateId,
          waylineTemplateId: activeAirline.waylineTemplateId,
          templateName: activeAirline.taskName,
        },
        breakPointEnable: values.breakPointEnable ? 'YES' : 'NO',
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
          // 重复类型
          submitData.cycleType = values.repeatFrequency.intervalType
          // 间隔时间
          submitData.intervalValue = values.repeatFrequency.intervalValue
          // 处理 周/月 重复频率
          if (values.repeatFrequency.intervalType === 'WEEKLY') {
            // 将 数组 转化成 字符串
            submitData.dayOfWeek = [...(values.repeatFrequency.dayOfWeek ?? [])]
              .sort() // toSorted (v110^) 可能不兼容老电脑
              .join(',')
          } else if (values.repeatFrequency.intervalType === 'MONTHLY') {
            submitData.dayOfMonth = [
              ...(values.repeatFrequency.dayOfMonth ?? []),
            ]
              .sort((a, b) => a - b)
              .join(',')
          }
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
        noPadding
      >
        <ConfigProvider
          theme={{
            cssVar: {
              key: 'dushu',
            },
            components: {
              Form: {
                labelFontSize: 12,
                verticalLabelMargin: 0,
                verticalLabelPadding: '0 0 4px 0',
              },
            },
          }}
        >
          <ScrollArea className="max-h-[80vh] mb-3 overflow-hidden">
            <Form
              className="m-3"
              autoComplete="off"
              layout="vertical"
              initialValues={{ type: 'SINGLE' }}
              form={form}
            >
              <Form.Item
                label={t('schedule.form.name.title')}
                name="name"
                required
                rules={[{ required: true }]}
              >
                <Input placeholder={t('common.form.pleaseInput')} />
              </Form.Item>
              <Form.Item
                label={t('schedule.form.wayline.title')}
                name="airlineIndex"
                required
                rules={[{ required: true }]}
              >
                <Select
                  placeholder={t('common.form.pleaseSelect')}
                  showSearch
                  optionFilterProp="name"
                  options={airlineOptions}
                />
              </Form.Item>
              <Form.Item
                label={t('schedule.form.device.title')}
                name="deviceId"
                rules={[{ required: true }]}
              >
                <Select
                  className="max-w-[374px]"
                  placeholder={t('common.form.pleaseSelect')}
                  showSearch
                  optionFilterProp="deviceName"
                  options={deviceOptions}
                />
              </Form.Item>
              <Form.Item
                label={t('schedule.form.type.title')}
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
                    {t('schedule.type.SINGLE.title')}
                  </Radio.Button>
                  <Radio.Button className="flex-1 text-center" value="REPEAT">
                    {t('schedule.type.REPEAT.title')}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              {
                {
                  SINGLE: <SingleFormItems />,
                  REPEAT: <REPEATFormItems />,
                }[type]
              }
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-1">
                  断点续飞
                  <Tooltip title="开启后，若飞行架次因电量不足等原因无法完成整个航线飞行，系统将记录待执行任务。">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <Form.Item
                  name="breakPointEnable"
                  noStyle
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>
              </div>
              <TipInfo />
            </Form>
          </ScrollArea>
        </ConfigProvider>
        {holder}
      </XModal>
    )
  },
)

ScheduleModal.displayName = 'CreateSchedule'

export default ScheduleModal
