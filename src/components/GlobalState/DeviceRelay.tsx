import mitt from 'mitt'
import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import XModal from '../XModal'
import {
  getRelayDeviceList,
  relayActionPlanRecord,
} from '@/service/modules/action-plan'
import { DeviceEnum } from '@/enum/device'
import { WarningOutlined } from '@ant-design/icons'
import { useAppMsg } from '@/hooks/useAppMsg'
import { Form } from 'antd'
import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import TagItemV2 from '../ui/TagItemV2'
import {
  BatteryStatusTag,
  TaskStatusTag,
} from '@/pages/situation/source/components/DeviceItem'

export type DeviceRelayNotifyType = {
  /** 断点 ID */
  breakPointId: number
  /** 行动 ID */
  actionId: number
  /** 被断点的设备 */
  deviceId: string
  deviceName?: string
  /** 接力设备 ID */
  relayDeviceId?: string
  /** 接力设备名称 */
  relayDeviceName?: string
}

type PropsType = unknown

export const deviceRelayEmitter = mitt<{
  notify: DeviceRelayNotifyType
}>()

/** 设备断点续飞 */
const DeviceRelay: FC<PropsType> = memo(() => {
  const msgApi = useAppMsg()

  const [open, setOpen] = useState(false)
  const [relayData, setRelayData] = useState<DeviceRelayNotifyType>()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm<{ deviceId: string }>()
  const breakPointId = relayData?.breakPointId
  const queryClient = useQueryClient()
  const { data: relayDevices = [], isLoading: deviceListLoading } = useQuery(
    {
      queryKey: ['getRelayDeviceList', breakPointId],
      queryFn: () =>
        getRelayDeviceList({
          breakPointId: breakPointId!,
          type: DeviceEnum.UAV,
        }),
      select: (res) => res.data?.rows ?? [],
      enabled: !!breakPointId && open,
    },
    queryClient,
  )

  useEffect(() => {
    const handleNotify = (data: DeviceRelayNotifyType) => {
      setRelayData(data)
      form.resetFields()
      form.setFieldsValue({
        deviceId: data.relayDeviceId ?? undefined,
      })
      setOpen(true)
    }

    deviceRelayEmitter.on('notify', handleNotify)

    return () => {
      deviceRelayEmitter.off('notify', handleNotify)
    }
  }, [form])

  const deviceOptions = useMemo(
    () =>
      relayDevices.map((device) => ({
        value: device.deviceId,
        label: device.deviceName,
      })),
    [relayDevices],
  )

  const handleClose = () => {
    setOpen(false)
    setRelayData(undefined)
    form.resetFields()
  }

  const handleConfirm = useMemoizedFn(async () => {
    if (!relayData) {
      return
    }
    const { deviceId } = await form.validateFields()
    setConfirmLoading(true)
    try {
      await relayActionPlanRecord({
        breakPointId: relayData.breakPointId,
        deviceId,
      })
      msgApi.success('接力指令已发送')
      handleClose()
    } finally {
      setConfirmLoading(false)
    }
  })

  const prefixTip = useMemo(() => {
    if (!relayData?.deviceName) {
      return null
    }
    return (
      <TagItemV2 className="mr-1">
        <DeviceIconUAV2 />
        {relayData.deviceName}
      </TagItemV2>
    )
  }, [relayData?.deviceName])

  return (
    <XModal
      title={
        <>
          <WarningOutlined className="text-yellow-400" /> 设备断点续飞
        </>
      }
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmTitle="是"
      cancelText="否"
      width={400}
      centered
      confirmLoading={confirmLoading}
    >
      <div className="mb-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center">
            {prefixTip}
            <span>任务中断，是否需要接力飞行？</span>
          </div>
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="deviceId"
              rules={[{ required: true, message: '请选择接力设备' }]}
              noStyle
            >
              <Select
                className="w-full"
                placeholder="请选择接力设备"
                options={deviceOptions}
                showSearch={true}
                optionFilterProp="label"
                allowClear
                loading={deviceListLoading}
                optionRender={(_, { index }) => {
                  const device = relayDevices[index as number]
                  return (
                    <div className="flex flex-col">
                      <div className="flex gap-1">
                        <DeviceIcon type={device.deviceType} />
                        <div>{device.deviceName}</div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <TaskStatusTag taskStatus={device.status} />
                        <BatteryStatusTag battery={device.remainingPower} />
                      </div>
                    </div>
                  )
                }}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </XModal>
  )
})

DeviceRelay.displayName = 'DeviceRelay'

export default DeviceRelay
