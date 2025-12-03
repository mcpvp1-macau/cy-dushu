import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { useWaylineAndDeviceFormOptions } from '@/hooks/device/useAirlineOptions'
import { usePilotTreeData } from '@/hooks/jinghang/usePilots'
import { createActionItem, getPilotTree } from '@/service/modules/action-item'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useMemoizedFn } from 'ahooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Form, Input, InputNumber, Radio, TreeSelect } from 'antd'
import { useMemo, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { pick } from 'lodash'
import Select from '@/components/AntdOverride/Select'
import { useAppMsg } from '@/hooks/useAppMsg'
import { CaretDownFilled } from '@ant-design/icons'
import { pilotMock } from './pilot-mock'

type PropsType = {
  actionId: string
}

type PilotInfo = {
  pilotName: string
  orgCode?: string
  orgName?: string
}

const AddSHJHTask: FC<PropsType> = memo(({ actionId }) => {
  const message = useAppMsg()
  const [open, setOpen] = useState(false)
  const [flightType, setFlightType] = useState<0 | 1>(0)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const {
    airlineOptions,
    deviceOptions,
    airlineTemplateList,
    allDevices,
    allowMultipleDevice,
    holder,
  } = useWaylineAndDeviceFormOptions(form)

  const uavStates = useMapDevicesStore((s) => s.uavStates)

  const { data: pilotData = [] } = useQuery(
    {
      queryKey: ['pilotTree'],
      queryFn: () => {
        // MOCK
        if (
          location.hostname === 'localhost' ||
          location.hostname.startsWith('test.')
        ) {
          return Promise.resolve(pilotMock)
        }
        return getPilotTree()
      },
      select: (d: any) => d.data?.rows ?? [],
    },
    queryClient,
  )

  const { treeData } = usePilotTreeData(pilotData as any[])

  const pilotInfoMap = useMemo(() => {
    const map = new Map<string, PilotInfo>()

    const dfs = (
      nodes: any[] = [],
      parentOrg: { orgCode?: string; orgName?: string } = {},
    ) => {
      nodes.forEach((node) => {
        const currentOrg = {
          orgCode: node.orgCode ?? parentOrg.orgCode,
          orgName: node.name ?? parentOrg.orgName,
        }
        node?.pilots?.forEach((pilot: any) => {
          map.set(pilot.userCode, {
            pilotName: pilot.name,
            orgCode: pilot.orgCode ?? currentOrg.orgCode,
            orgName: pilot.orgName ?? currentOrg.orgName,
          })
        })
        dfs(node?.children ?? [], currentOrg)
      })
    }

    dfs(pilotData)
    return map
  }, [pilotData])

  const resetForm = () => {
    form.resetFields()
    setFlightType(0)
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const handleFlightTypeChange = (value: 0 | 1) => {
    setFlightType(value)
    form.setFieldsValue({
      airlineIndex: undefined,
      deviceIds: undefined,
    })
  }

  const handleConfirm = useMemoizedFn(async () => {
    const values = await form.validateFields()

    const pilotInfo = pilotInfoMap.get(values.pilotCode)
    if (!pilotInfo) {
      message.error('请选择飞手')
      return
    }

    const selectedDeviceIds = Array.isArray(values.deviceIds)
      ? values.deviceIds
      : [values.deviceIds].filter(Boolean)

    const primaryDevice = allDevices.find(
      (e) => e.deviceId === selectedDeviceIds[0],
    )
    const deviceType = primaryDevice?.deviceType ?? DeviceEnum.UAV

    const commonData: any = {
      ...pick(values, ['actionItemName']),
      actionId,
      deviceIds: Array.isArray(values.deviceIds)
        ? values.deviceIds.join(',')
        : values.deviceIds,
      deviceType,
      flightType,
      pilotName: pilotInfo.pilotName,
      orgCode: pilotInfo.orgCode,
      orgName: pilotInfo.orgName,
    }

    if (flightType === 0) {
      const realtimeState = primaryDevice && uavStates?.[primaryDevice.deviceId]
      const longitude =
        realtimeState?.longitude ?? primaryDevice?.properties?.longitude ?? null
      const latitude =
        realtimeState?.latitude ?? primaryDevice?.properties?.latitude ?? null

      if (!longitude || !latitude) {
        message.error('所选设备缺少经纬度')
        return
      }

      Object.assign(commonData, {
        ...pick(values, ['flightAltitude', 'returnAltitude', 'targetAddress']),
        uavLongitude: longitude,
        uavLatitude: latitude,
      })
    } else {
      const airline = airlineTemplateList?.[values.airlineIndex]
      if (airline) {
        Object.assign(commonData, {
          templateId: airline.templateId,
          waylineTemplateId: airline.waylineTemplateId,
          taskTemplateInfo: {
            taskBasic: airline.taskBasic,
            defaultDeviceId: values.deviceIds,
            parameters: JSON.parse(airline.parameters),
          },
        })
      }
    }

    try {
      await createActionItem(commonData)
      setOpen(false)
      resetForm()
      await queryClient.invalidateQueries({
        queryKey: ['action', actionId, 'items'],
      })
    } finally {
      setConfirmLoading(false)
    }
  })

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconButton onClick={() => setOpen(true)}>
        <IconPlus />
      </IconButton>
      <XModal
        title={t('action.detail.task.add.title')}
        open={open}
        confirmTitle="申报"
        confirmLoading={confirmLoading}
        centered
        width={400}
        onClose={handleClose}
        onConfirm={handleConfirm}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ flightType: 0 }}
        >
          <Form.Item
            label={t('action.detail.task.add.form.name.label')}
            name="actionItemName"
            rules={[
              {
                required: true,
                message: t('action.detail.task.add.form.name.required_msg'),
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            className="w-full flex gap-[1px] mb-2"
            value={flightType}
            onChange={(e) => handleFlightTypeChange(e.target.value)}
          >
            <Radio.Button className="flex-1 text-center" value={0}>
              手动飞行
            </Radio.Button>
            <Radio.Button className="flex-1 text-center" value={1}>
              航线飞行
            </Radio.Button>
          </Radio.Group>

          {flightType === 0 ? (
            <>
              <Form.Item
                label="飞行设备"
                name="deviceIds"
                rules={[{ required: true, message: '请选择飞行设备' }]}
              >
                <Select
                  options={deviceOptions}
                  placeholder="选择设备"
                  optionFilterProp="deviceName"
                  showSearch
                />
              </Form.Item>
              <Form.Item
                label="飞行高度"
                name="flightAltitude"
                rules={[{ required: true, message: '请输入飞行高度' }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  addonAfter={<span className="mx-1">m</span>}
                  placeholder="100m"
                />
              </Form.Item>
              <Form.Item
                label="返航高度"
                name="returnAltitude"
                rules={[{ required: true, message: '请输入返航高度' }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  addonAfter={<span className="mx-1">m</span>}
                  placeholder="100m"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label="选择航线"
                name="airlineIndex"
                rules={[{ required: true, message: '请选择航线' }]}
              >
                <Select
                  options={airlineOptions}
                  placeholder="选择航线"
                  optionFilterProp="name"
                  onChange={() => {
                    form.setFieldValue('deviceIds', undefined)
                  }}
                />
              </Form.Item>
              <Form.Item
                label={t('action.detail.task.add.form.device.label')}
                name="deviceIds"
                rules={[
                  {
                    required: true,
                    message: t(
                      'action.detail.task.add.form.device.required_msg',
                    ),
                  },
                ]}
              >
                <Select
                  options={deviceOptions}
                  mode={allowMultipleDevice ? 'multiple' : undefined}
                  placeholder={t('action.detail.task.add.form.device.label')}
                  optionFilterProp="deviceName"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="执飞飞手"
            name="pilotCode"
            rules={[{ required: true, message: '请选择飞手' }]}
          >
            <TreeSelect
              treeData={treeData}
              placeholder="选择飞手"
              showSearch
              treeDefaultExpandAll
              allowClear
              treeNodeFilterProp="label"
              suffixIcon={<CaretDownFilled style={{ pointerEvents: 'none' }} />}
            />
          </Form.Item>
        </Form>
        {holder}
      </XModal>
    </div>
  )
})

AddSHJHTask.displayName = 'AddSHJHTask'

export default AddSHJHTask
