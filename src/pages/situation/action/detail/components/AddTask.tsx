import IconPlus from '@/assets/icons/jsx/IconPlus'
import DeviceIcon from '@/components/device/DeviceIcon'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { createActionItem } from '@/service/modules/action-item'
import { getAirlineTemplateList } from '@/service/modules/airline'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { pick } from 'lodash'

type PropsType = {
  actionId: string
}

type Option = {
  label: ReactNode
  value: any
}

const createTaskConfig = (
  airlineTemplateOptions: Option[],
  deviceOptions: Option[],
) =>
  [
    {
      label: '任务名称',
      name: 'actionItemName',
      type: 'input',
      rules: [{ required: true, message: '请输入任务名称' }],
    },
    {
      label: '选择航线',
      name: 'airlineIndex',
      type: 'select',
      options: airlineTemplateOptions,
    },
    {
      label: '选择设备',
      name: 'deviceIds',
      type: 'select',
      options: deviceOptions,
      otherProps: {
        optionFilterProp: 'deviceName',
      },
      rules: [{ required: true, message: '请选择设备' }],
    },
    {
      label: '选择飞手',
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

  const { data: airlineTemplateList } = useQuery(
    {
      queryKey: ['airlineTemplate'],
      queryFn: () => getAirlineTemplateList({ isPage: false }),
      select: (d) => d?.data.rows ?? [],
    },
    queryClient,
  )

  const allDevices = useMapDevicesStore((s) => s.allDevices)
  const deviceOptions = useMemo(() => {
    return allDevices.map((e) => ({
      label: (
        <div className="flex gap-2">
          <DeviceIcon type={e.deviceType} />
          {e.deviceName}
        </div>
      ),
      deviceName: e.deviceName,
      value: e.deviceId,
    }))
  }, [])

  const airlineTemplateOptions = useMemo(
    () =>
      airlineTemplateList?.map((e, i) => ({
        label: e.taskName,
        value: i,
      })) ?? [],
    [airlineTemplateList],
  )

  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleConfirm = useMemoizedFn(async (val: any) => {
    const airline = airlineTemplateList?.[val.airlineIndex]
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

  const formItems = useMemo(
    () => createTaskConfig(airlineTemplateOptions, deviceOptions),
    [airlineTemplateOptions, deviceOptions],
  )

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={() => setOpen(true)}>
        <IconPlus />
      </IconButton>
      <FormModal
        title="创建任务"
        items={formItems}
        open={open}
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
