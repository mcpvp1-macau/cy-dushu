import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconPreview from '@/assets/icons/jsx/IconPreview'
import DeviceIcon from '@/components/device/DeviceIcon'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { emtpyArray } from '@/constant/data'
import { WaylineEnum } from '@/constant/uav/wayline'
import { DeviceEnum } from '@/enum/device'
import { usePilotTreeData } from '@/hooks/jinghang/usePilots'
import useWaylinePreview from '@/hooks/wayline/useWaylinePreview'
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
  pilotTreeData: any[],
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
    ...(globalConfig.useShanghaiBanRoutes
      ? [
          {
            label: t('action.detail.task.add.form.staff.label'),
            name: 'feishou',
            type: 'tree-select',
            treeData: pilotTreeData,
            otherProps: {
              multiple: false,
            },
          },
        ]
      : []),
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
          'mapping2d', // 第三方
          'mapping3d',
        ].includes(taskType as WaylineEnum)
      ) {
        list = list.filter((e) => e.deviceType === DeviceEnum.UAV)
      } else if (
        [WaylineEnum.RebotDogWayline, WaylineEnum.PointCloud3DWayline].includes(
          taskType as WaylineEnum,
        )
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

  const { holder, handlePreview } = useWaylinePreview()
  const airlineTemplateOptions = useMemo(
    () =>
      airlineTemplateList?.map((e, i) => ({
        label: (
          <div className="flex justify-between">
            <div className="flex gap-2">
              <WaylineIcon type={e.taskType} />
              {e.taskName}
            </div>
            {[WaylineEnum.PointWayline, WaylineEnum.AreaWayline].includes(
              e.taskType as WaylineEnum,
            ) && (
              <IconButton
                toolTipProps={{ title: t('common.preview') }}
                onClick={(evt) => {
                  evt.stopPropagation()
                  handlePreview(e)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                className="hover:text-white scale-90"
              >
                <IconPreview />
              </IconButton>
            )}
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
    // 获取设备类型
    let deviceType = DeviceEnum.UAV
    if (Array.isArray(val.deviceIds)) {
      const device = allDevices.find((e) => e.deviceId === val.deviceIds[0])
      val.deviceIds = val.deviceIds.join(',')
      if (device) {
        deviceType = device.deviceType as DeviceEnum
      }
    } else {
      const device = allDevices.find((e) => e.deviceId === val.deviceIds)
      if (device) {
        deviceType = device.deviceType as DeviceEnum
      }
    }

    const data = {
      ...pick(val, ['actionItemName', 'deviceIds']),
      pilotCode: val.shou,
      actionId,
      deviceType,
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

  const { data: pilotData = emtpyArray } = useQuery({
    queryKey: ['pilotTree'],
    queryFn: () => getPilotTree(),
    select: (d) => d.data?.rows ?? emtpyArray,
    enabled: !!globalConfig.useShanghaiBanRoutes,
  })

  const { treeData } = usePilotTreeData(pilotData)

  const allowMultipleDevice = taskType === WaylineEnum.SwarmWayline
  const formItems = useMemo(
    () =>
      createTaskConfig(
        t,
        airlineTemplateOptions,
        deviceOptions,
        treeData,
        allowMultipleDevice,
      ),
    [
      i18n.language,
      airlineTemplateOptions,
      deviceOptions,
      allowMultipleDevice,
      treeData,
    ],
  )

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
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
      {holder}
    </div>
  )
})

AddTask.displayName = 'AddTask'

export default AddTask
