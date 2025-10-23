import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import Select from '@/components/AntdOverride/Select'
import DeviceIcon from '@/components/device/DeviceIcon'
import TagItemV2 from '@/components/ui/TagItemV2'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  BatteryStatusTag,
  TaskStatusTag,
} from '@/pages/situation/source/components/DeviceItem'
import {
  getRelayDeviceList,
  relayActionPlanRecord,
} from '@/service/modules/action-plan'
import { Form, Skeleton } from 'antd'
import type { FC } from 'react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import IconRelayWayline from '@/assets/icons/jsx/IconRelayWayline'
import useStartActionItem from '@/hooks/service/action/useStartActionItem'
import { round } from 'lodash'
import { formatDistance } from '@/utils/format/unit'

type RelayDeviceModalProps = {
  open: boolean
  breakPointId?: number
  deviceName?: string
  relayDeviceId?: string
  onClose: () => void
  onSuccess?: () => void | Promise<void>
}

const RelayDeviceModal: FC<RelayDeviceModalProps> = ({
  open,
  breakPointId,
  deviceName,
  relayDeviceId,
  onClose,
  onSuccess,
}) => {
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm<{ deviceId: string }>()

  const { startActionItem: start, stopModalHolder } = useStartActionItem()

  const { data: relayDevices = [], isLoading: relayDeviceLoading } = useQuery(
    {
      queryKey: ['relayDeviceList', breakPointId],
      queryFn: () =>
        getRelayDeviceList({
          breakPointId: breakPointId!,
          type: DeviceEnum.UAV,
        }),
      select: (res) => res.data?.rows ?? [],
      enabled: open && !!breakPointId,
    },
    queryClient,
  )

  const relayDeviceOptions = useMemo(
    () =>
      relayDevices.map((d) => ({
        value: d.deviceId,
        label: (
          <div className="flex gap-2">
            <DeviceIcon type={DeviceEnum.UAV} />
            {d.deviceName}
          </div>
        ),
        deviceName: d.deviceName,
        remainingPower: d.remainingPower,
        status: d.status,
        distance: round(d.distance ?? -1, 1),
      })),
    [relayDevices],
  )

  const relayModalPrefixTip = useMemo(() => {
    if (!deviceName) {
      return null
    }
    return (
      <TagItemV2 className="mr-1">
        <DeviceIconUAV2 />
        {deviceName}
      </TagItemV2>
    )
  }, [deviceName])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }
    form.setFieldsValue({
      deviceId: relayDeviceId ?? undefined,
    })
  }, [open, relayDeviceId, form])

  const handleClose = useMemoizedFn(() => {
    form.resetFields()
    onClose()
  })

  const handleConfirm = useMemoizedFn(async () => {
    if (!breakPointId) {
      return
    }
    const { deviceId } = await form.validateFields()
    setConfirmLoading(true)
    try {
      await start(
        async () =>
          await relayActionPlanRecord({
            breakPointId,
            deviceId,
          }),
      )
      msgApi.success('接力指令已发送')
      await onSuccess?.()
      handleClose()
    } finally {
      setConfirmLoading(false)
    }
  })

  return (
    <>
      {stopModalHolder}
      <XModal
        title={
          <>
            <IconRelayWayline /> 设备接力飞行
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
              {relayModalPrefixTip}
              <span>任务中断，是否需要接力飞行？</span>
            </div>
            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item
                name="deviceId"
                rules={[{ required: true, message: '请选择接力设备' }]}
                noStyle
              >
                {relayDeviceLoading ? (
                  <Skeleton.Input active block></Skeleton.Input>
                ) : (
                  <Select
                    className="w-full"
                    placeholder="请选择接力设备"
                    options={relayDeviceOptions}
                    showSearch
                    allowClear
                    optionFilterProp="deviceName"
                    optionRender={({ data: device }) => {
                      return (
                        <div className="flex flex-col">
                          <div className="flex gap-1">
                            <DeviceIcon type={DeviceEnum.UAV} />
                            <div>{device.deviceName}</div>
                          </div>
                          <div className="flex mt-1 justify-between">
                            <div className="flex gap-2  ">
                              <TaskStatusTag taskStatus={device.status} />
                              <BatteryStatusTag
                                battery={device.remainingPower ?? -1}
                              />
                            </div>
                            <TagItemV2 type="success">
                              {formatDistance(device.distance)}
                            </TagItemV2>
                          </div>
                        </div>
                      )
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          </div>
        </div>
      </XModal>
    </>
  )
}

export default memo(RelayDeviceModal)
