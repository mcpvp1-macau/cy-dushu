import IconPlus from '@/assets/icons/jsx/IconPlus'
import DeviceIcon from '@/components/device/DeviceIcon'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { emtpyArray } from '@/constant/data'
import { WaylineEnum } from '@/constant/uav/wayline'
import { DeviceEnum } from '@/enum/device'
import { WaylineIcon } from '@/pages/wayline/components/AirlineTemplateListItem'
import { createActionItem, getPilotTree } from '@/service/modules/action-item'
import { getAirlineTemplateList } from '@/service/modules/airline'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { Form } from 'antd'
import { TFunction } from 'i18next'
import { pick } from 'lodash'

type PropsType = {
  actionId: string
}

type Option = {
  label: ReactNode
  value: any
}

const createTaskConfig = (
  t: TFunction,
  airlineTemplateOptions: Option[],
  deviceOptions: Option[],
  allowMultipleDevice: boolean,
) =>
  [
    {
      label: t('action.detail.task.add.form.name.label'),
      name: 'actionItemName',
      type: 'input',
      rules: [
        {
          required: true,
          message: t('action.detail.task.add.form.name.required_msg'),
        },
      ],
    },
    {
      label: t('action.detail.task.add.form.airline.label'),
      name: 'airlineIndex',
      type: 'select',
      options: airlineTemplateOptions,
      otherProps: {
        optionFilterProp: 'name',
        allowClear: true,
      },
    },
    {
      label: t('action.detail.task.add.form.device.label'),
      name: 'deviceIds',
      type: 'select',
      options: deviceOptions,
      otherProps: {
        optionFilterProp: 'deviceName',
        mode: allowMultipleDevice ? 'multiple' : undefined,
      },
      rules: [
        {
          required: true,
          message: t('action.detail.task.add.form.device.required_msg'),
        },
      ],
    },
    {
      label: t('action.detail.task.add.form.staff.label'),
      name: 'feishou',
      type: 'tree-select',
      treeData: [],
      otherProps: {
        multiple: true,
      },
    },
  ] as XFormItem[]

/** 添加子任务 */
const AddTask: FC<PropsType> = memo(({ actionId }) => {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const [form] = Form.useForm()

  const airlineIndex = Form.useWatch('airlineIndex', form)

  const { data: airlineTemplateList } = useQuery(
    {
      queryKey: ['airlineTemplate'],
      queryFn: () => getAirlineTemplateList({ isPage: false }),
      select: (d) => d?.data.rows ?? [],
    },
    queryClient,
  )

  const taskType = airlineTemplateList?.[airlineIndex]?.taskType

  useEffect(() => {
    form.setFieldValue('deviceIds', [])
  }, [taskType])

  const allDevices = useMapDevicesStore((s) => s.allDevices)
  const deviceOptions = useMemo(() => {
    let list = allDevices

    if (taskType) {
      if (
        [
          WaylineEnum.PointWayline,
          WaylineEnum.AreaWayline,
          WaylineEnum.SwarmWayline,
        ].includes(taskType as WaylineEnum)
      ) {
        list = list.filter((e) => e.deviceType === DeviceEnum.UAV)
      } else if (
        [WaylineEnum.RebotDogWayline].includes(taskType as WaylineEnum)
      ) {
        list = list.filter((e) => e.deviceType === DeviceEnum.UAV)
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

  const airlineTemplateOptions = useMemo(
    () =>
      airlineTemplateList?.map((e, i) => ({
        label: (
          <div className="flex gap-2">
            <WaylineIcon type={e.taskType} />
            {e.taskName}
          </div>
        ),
        value: i,
        name: e.taskName,
      })) ?? emtpyArray,
    [airlineTemplateList],
  )

  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleConfirm = useMemoizedFn(async (val: any) => {
    const airline = airlineTemplateList?.[val.airlineIndex]
    if (Array.isArray(val.deviceIds)) {
      val.deviceIds = val.deviceIds.join(',')
    }
    const data = {
      ...pick(val, ['actionItemName', 'deviceIds']),
      // extra: JSON.stringify(
      //   val.feishou?.map((v: string) => pilotMap.current?.get(v)) || [],
      // ),
      actionId,
      deviceType: 'UAV',
    }
    if (airline) {
      data['templateId'] = airline.templateId
      data['waylineTemplateId'] = airline.waylineTemplateId
      data['taskTemplateInfo'] = {
        taskBasic: airline.taskBasic,
        defaultDeviceId: val.deviceIds,
        parameters: JSON.parse(airline.parameters),
      }
    }
    setConfirmLoading(true)
    try {
      await createActionItem(data)
      setOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ['action', actionId, 'items'],
      })
    } finally {
      setConfirmLoading(false)
    }
  })

  const { data: pilotData } = useQuery({
    queryKey: ['pilotTree'],
    queryFn: () => getPilotTree(),
  })

  console.log('pilotData', pilotData)

  const allowMultipleDevice = taskType === WaylineEnum.SwarmWayline
  const formItems = useMemo(
    () =>
      createTaskConfig(
        t,
        airlineTemplateOptions,
        deviceOptions,
        allowMultipleDevice,
      ),
    [i18n.language, airlineTemplateOptions, deviceOptions, allowMultipleDevice],
  )

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={() => setOpen(true)}>
        <IconPlus />
      </IconButton>
      <FormModal
        title={t('action.detail.task.add.title')}
        items={formItems}
        open={open}
        form={form}
        confirmLoading={confirmLoading}
        onClose={() => {
          setOpen(false)
        }}
        onConfirm={handleConfirm}
      />
    </div>
  )
})

AddTask.displayName = 'AddTask'

export default AddTask
