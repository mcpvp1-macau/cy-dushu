import IconMinus from '@/assets/icons/jsx/IconMinus'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import Select from '@/components/AntdOverride/Select'
import XModal from '@/components/XModal'
import { useWaylineAndDeviceFormOptions } from '@/hooks/device/useAirlineOptions'
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
  TreeSelect,
  Switch,
  TimePicker,
} from 'antd'
import useFormInstance from 'antd/es/form/hooks/useFormInstance'
import type { Dayjs } from 'dayjs'
import DayOfMonthCheckboxGroup from './DayOfMonthCheckboxGroup'
import DayOfWeekCheckboxGroup from './DayOfWeekCheckboxGroup'
import { ScrollArea } from '@/components/ui/scroll-area'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'
import { useAppMsg } from '@/hooks/useAppMsg'
import { WaylineEnum } from '@/constant/uav/wayline'
import { getAllDeviceListV3 } from '@/service/modules/device'
import { getPilotTree } from '@/service/modules/action-item'
import { DeviceEnum } from '@/enum/device'
import DeviceIcon from '@/components/device/DeviceIcon'
import TagItemV2 from '@/components/ui/TagItemV2'
import LiqunTippy from '@/components/ui/LiqunTippy'
import { DictEnum } from '@/enum/dict'
import { useDictOptions } from '@/store/useDict.store'
import globalConfig from '@/global/config'
import { usePilotTreeData } from '@/hooks/jinghang/usePilots'
import { CaretDownFilled } from '@ant-design/icons'
import { pilotMock } from '@/pages/situation/action/detail/components/pilot-mock'

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
                    <div className="flex items-center gap-1">
                      {t('common.executeTime.title')}
                      <LiqunTippy
                        interactive={false}
                        content={t('schedule.tip.20minsInterval')}
                      >
                        <InfoCircleOutlined />
                      </LiqunTippy>
                    </div>
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
  deviceIds: string
  airlineIndex: number
  timeRange: Dayjs[]
  breakPointEnable?: boolean
  landDeviceId?: string
  taskType: 'NORMAL' | 'MULTI'
  actionType?: string
  pilotCode?: string
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
    const msgApi = useAppMsg()
    const { t } = useTranslation()

    const [form] = Form.useForm<FormValuesType>()
    const type = Form.useWatch('type', form) ?? data?.type
    const taskType =
      (Form.useWatch('taskType', form) || data?.taskType) ?? 'NORMAL'
    const isShJhEnv = globalConfig.env === 'sh-jh'

    const _actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
    const actionTypeOptions = useMemo(
      () =>
        _actionTypeOptions.map((item) => ({
          value: item.label,
          label: item.label,
        })),
      [_actionTypeOptions],
    )

    const {
      airlineOptions,
      deviceOptions,
      airlineTemplateList,
      allDevices,
      allowMultipleDevice,
      holder,
    } = useWaylineAndDeviceFormOptions(form)

    const filteredAirlineOptions = useMemo(() => {
      if (taskType === 'MULTI') {
        return airlineOptions.filter((e) =>
          [WaylineEnum.AreaWayline, WaylineEnum.PointWayline].includes(
            e.type as WaylineEnum,
          ),
        )
      }
      return airlineOptions
    }, [taskType, airlineOptions])

    const queryClient = useQueryClient()
    const { data: dockList } = useQuery(
      {
        queryKey: ['allDockDevices'],
        queryFn: () =>
          getAllDeviceListV3({
            type: `${DeviceEnum.UAV_AIRPORT},${DeviceEnum.UAV}`,
          }),
        enabled: taskType === 'MULTI' && open,
        select: (d) => d.data.rows,
      },
      queryClient,
    )

    const { data: pilotData = [] } = useQuery(
      {
        queryKey: ['pilotTree'],
        queryFn: () => {
          if (
            location.hostname === 'localhost' ||
            location.hostname.startsWith('test.')
          ) {
            return Promise.resolve(pilotMock)
          }
          return getPilotTree()
        },
        select: (d: any) => d.data?.rows ?? [],
        enabled: isShJhEnv && open,
      },
      queryClient,
    )

    const { treeData, pilotMap } = usePilotTreeData(pilotData as any[])

    const dockOptions = useMemo(
      () =>
        dockList
          ?.filter((e) => e.deviceType === DeviceEnum.UAV_AIRPORT)
          .map((e) => ({
            label: (
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <DeviceIcon type={e.deviceType} />
                  {e.deviceName}
                </div>
                {e.childrenDevices?.length ? (
                  <TagItemV2 type="error">{t('common.hosted')}</TagItemV2>
                ) : (
                  <TagItemV2 type="success">{t('common.hostless')}</TagItemV2>
                )}
              </div>
            ),
            deviceName: e.deviceName,
            value: e.deviceId,
          })),
      [dockList],
    )

    useUpdateEffect(() => {
      form.setFieldValue('executeTime', [undefined])
    }, [type])

    // 初始化表单数据 ----------------------------------------------------------------
    useEffect(() => {
      if (!open) {
        form.resetFields()
        return
      }
      if (data) {
        form.setFieldsValue({
          name: data.name,
          deviceIds: data.actionConfig?.deviceIds,
          actionType: data.actionType,
          pilotCode: data.pilotCode,
          landDeviceId: data.actionConfig?.landDeviceId,
          airlineIndex: airlineTemplateList?.findIndex(
            (e) =>
              e.waylineTemplateId === data.actionConfig?.waylineTemplateId ||
              e.templateId === data.actionConfig?.templateId,
          ),
          type: data.type as any,
          taskType: (data.taskType || 'NORMAL') as any,
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
      const activeAirline = airlineTemplateList!.at(values.airlineIndex)!
      const parameters = shouldJson(activeAirline!.parameters)

      // 获取设备类型
      let device: API_DEVICE.domain.Device | undefined
      if (Array.isArray(values.deviceIds)) {
        device = allDevices.find((e) => e.deviceId === values.deviceIds[0])
        values.deviceIds = values.deviceIds.join(',')
      } else {
        device = allDevices.find((e) => e.deviceId === values.deviceIds)
      }

      if (!device) {
        msgApi.error(t('schedule.errors.selectDevice.msg'))
        return
      }

      const submitData: API_ACTION_PLAN.domain.Plan = {
        name: values.name,
        actionConfig: {
          deviceIds: values.deviceIds,
          deviceNames: device?.deviceName,
          landDeviceId: values.landDeviceId || undefined,
          deviceType: device?.deviceType,
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
        taskType: values.taskType,
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

      if (isShJhEnv) {
        const pilotInfo = pilotMap.get(values.pilotCode as string)
        if (!pilotInfo) {
          msgApi.error('请选择飞手')
          return
        }
        Object.assign(submitData, {
          pilotName: pilotInfo.pilotName,
          orgCode: pilotInfo.orgCode,
          orgName: pilotInfo.orgName,
          flightType: 2,
          actionType: values.actionType,
        })
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
              initialValues={{ type: 'SINGLE', taskType: 'NORMAL' }}
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
              {isShJhEnv && (
                <Form.Item
                  label="行动类型"
                  name="actionType"
                  required
                  rules={[{ required: true, message: '请选择行动类型' }]}
                >
                  <Select
                    placeholder={t('common.form.pleaseSelect')}
                    options={actionTypeOptions}
                  />
                </Form.Item>
              )}
              {/* <Form.Item
                label={t('schedule.form.taskType.title')}
                name="taskType"
                required
                rules={[{ required: true }]}
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  className="w-full flex gap-[1px]"
                  onChange={(e) => {
                    const taskType = e.target.value
                    if (taskType === 'MULTI' && type === 'REPEAT') {
                      form.setFieldValue('type', 'SINGLE')
                    }
                    form.setFieldValue('airlineIndex', undefined)
                    form.setFieldValue('deviceIds', undefined)
                  }}
                >
                  <Radio.Button className="flex-1 text-center" value="NORMAL">
                    {t('schedule.taskType.NORMAL.title')}
                  </Radio.Button>
                  <Radio.Button className="flex-1 text-center" value="MULTI">
                    {t('schedule.taskType.MULTI.title')}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item> */}
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
                  options={filteredAirlineOptions}
                  onChange={() => {
                    form.setFieldValue('deviceIds', undefined)
                  }}
                />
              </Form.Item>
              <Form.Item
                label={t('schedule.form.device.title')}
                name="deviceIds"
                rules={[{ required: true }]}
              >
                <Select
                  className="max-w-[374px]"
                  placeholder={t('common.form.pleaseSelect')}
                  showSearch
                  optionFilterProp="deviceName"
                  options={deviceOptions}
                  mode={allowMultipleDevice ? 'multiple' : undefined}
                />
              </Form.Item>

              {isShJhEnv && (
                <Form.Item
                  label="飞手"
                  name="pilotCode"
                  rules={[{ required: true, message: '请选择飞手' }]}
                >
                  <TreeSelect
                    treeData={treeData}
                    placeholder="选择飞手"
                    showSearch
                    treeDefaultExpandAll
                    allowClear
                    treeNodeFilterProp="title"
                    suffixIcon={
                      <CaretDownFilled style={{ pointerEvents: 'none' }} />
                    }
                  />
                </Form.Item>
              )}

              {taskType === 'MULTI' && (
                <Form.Item
                  label={t('schedule.form.landDevice.title')}
                  name="landDeviceId"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="max-w-[374px]"
                    placeholder={t('common.form.pleaseSelect')}
                    showSearch
                    optionFilterProp="deviceName"
                    options={dockOptions}
                    mode={allowMultipleDevice ? 'multiple' : undefined}
                  />
                </Form.Item>
              )}

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
                  {taskType === 'NORMAL' && (
                    <Radio.Button className="flex-1 text-center" value="REPEAT">
                      {t('schedule.type.REPEAT.title')}
                    </Radio.Button>
                  )}
                </Radio.Group>
              </Form.Item>

              {
                {
                  SINGLE: <SingleFormItems />,
                  REPEAT: <REPEATFormItems />,
                }[type]
              }
              {taskType === 'NORMAL' && (
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-1">
                    {t('common.resumeFromBreakPoint')}
                    <LiqunTippy content="开启后，若飞行架次因电量不足等原因无法完成整个航线飞行，系统将记录待执行任务。">
                      <InfoCircleOutlined />
                    </LiqunTippy>
                  </div>
                  <Form.Item
                    name="breakPointEnable"
                    noStyle
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                </div>
              )}
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
