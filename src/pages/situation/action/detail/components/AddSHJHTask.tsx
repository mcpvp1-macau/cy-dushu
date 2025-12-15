import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { useWaylineAndDeviceFormOptions } from '@/hooks/device/useAirlineOptions'
import { usePilotTreeData } from '@/hooks/jinghang/usePilots'
import { createActionItem, getPilotTree } from '@/service/modules/action-item'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import usePositionPickerStore from '@/store/map/usePositionPicker.store'
import { useMemoizedFn } from 'ahooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Form, Input, InputNumber, Radio, TreeSelect } from 'antd'
import { useEffect, useMemo, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { pick } from 'lodash'
import Select from '@/components/AntdOverride/Select'
import { useAppMsg } from '@/hooks/useAppMsg'
import { CaretDownFilled, AimOutlined } from '@ant-design/icons'
import { pilotMock } from './pilot-mock'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import { shouldJson } from '@/utils/json'
import { parseLastWaypoint, parseMaxFlightAltitude } from '@/utils/wayline'

type PropsType = {
  actionId: string
  actionType: string
  openTriggerKey?: number
  onSuccess?: () => void
  defaultDeviceId?: string
}

const AddSHJHTask: FC<PropsType> = memo(
  ({
    actionId,
    actionType,
    openTriggerKey,
    onSuccess,
    defaultDeviceId,
  }) => {
    const message = useAppMsg()
    const [open, setOpen] = useState(false)
    const [flightType, setFlightType] = useState<0 | 1>(0)
    const [confirmLoading, setConfirmLoading] = useState(false)

    useEffect(() => {
      if (openTriggerKey) {
        setOpen(true)
      }
    }, [openTriggerKey])

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [form] = Form.useForm()

  // 选点相关状态
  const startPicking = usePositionPickerStore((s) => s.startPicking)
  const stopPicking = usePositionPickerStore((s) => s.stopPicking)
  const isPicking = usePositionPickerStore((s) => s.isPicking)

  const {
    airlineOptions,
    deviceOptions,
    airlineTemplateList,
    allDevices,
    allowMultipleDevice,
    holder,
  } = useWaylineAndDeviceFormOptions(form)

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
  const currentActionType = useMemo(
    () => actionTypeOptions.find((e) => e.value === actionType),
    [actionTypeOptions, actionType],
  )

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

  const { treeData, pilotMap } = usePilotTreeData(pilotData)

  const resetForm = () => {
    form.resetFields()
    setFlightType(0)
    stopPicking()
  }

  const deviceOptionsForForm = useMemo(() => {
    if (!defaultDeviceId) {
      return deviceOptions
    }
    const match = deviceOptions.find((e) => e.value === defaultDeviceId)
    return [
      match || {
        label: defaultDeviceId,
        value: defaultDeviceId,
        deviceName: defaultDeviceId,
      },
    ]
  }, [defaultDeviceId, deviceOptions])

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const allDeviceMap = useMemo(
    () =>
      allDevices.reduce<Record<string, (typeof allDevices)[number]>>(
        (acc, cur) => {
          acc[cur.deviceId] = cur
          return acc
        },
        {},
      ),
    [allDevices],
  )

  // 地图选点处理函数
  const handlePickPosition = useMemoizedFn(() => {
    startPicking((lng: number, lat: number) => {
      form.setFieldsValue({
        uavTargetLongitude: lng,
        uavTargetLatitude: lat,
      })
    })
  })

  const handleFlightTypeChange = (value: 0 | 1) => {
    setFlightType(value)
    form.setFieldsValue({
      airlineIndex: undefined,
      deviceIds: defaultDeviceId
        ? allowMultipleDevice
          ? [defaultDeviceId]
          : defaultDeviceId
        : undefined,
    })
  }

  const handleConfirm = useMemoizedFn(async () => {
    const values = await form.validateFields()

    const pilotInfo = pilotMap.get(values.pilotCode)
    if (!pilotInfo) {
      message.error('请选择飞手')
      return
    }

    if (!currentActionType) {
      message.error('行动类型不存在')
      return
    }

    const selectedDeviceIds = Array.isArray(values.deviceIds)
      ? values.deviceIds
      : [values.deviceIds].filter(Boolean)

    const { deviceMap } = useMapDevicesStore.getState()
    const selectedDeviceId = selectedDeviceIds[0]
    const fallbackDevice = selectedDeviceId
      ? deviceMap[selectedDeviceId]
      : undefined
    const primaryDevice = selectedDeviceId
      ? allDeviceMap[selectedDeviceId] ?? fallbackDevice
      : fallbackDevice
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
      actionType: currentActionType.label,
    }

    if (flightType === 0) {
      const longitude = primaryDevice?.properties?.longitude ?? null
      const latitude = primaryDevice?.properties?.latitude ?? null

      if (!longitude || !latitude) {
        message.error('所选设备缺少经纬度')
        return
      }

      // 验证目标经纬度
      const targetLng = values.uavTargetLongitude
      const targetLat = values.uavTargetLatitude
      if (targetLng == null || targetLat == null) {
        message.error('请输入目标经纬度')
        return
      }

      Object.assign(commonData, {
        ...pick(values, ['flightAltitude', 'returnAltitude', 'targetAddress']),
        uavFlightLongitude: longitude,
        uavFlightLatitude: latitude,
        uavTargetLongitude: targetLng,
        uavTargetLatitude: targetLat,
      })
    } else {
      const airline = airlineTemplateList?.[values.airlineIndex]
      if (airline) {
        const parameters = shouldJson(airline.parameters)
        const taskBasic = shouldJson(airline.taskBasic)

        // 解析航线最后一个航点作为目标位置
        const lastWaypoint = parseLastWaypoint(parameters)

        // 解析航线中所有航点的最高飞行高度
        const maxFlightAltitude = parseMaxFlightAltitude(parameters)

        // 解析返航高度
        const returnAltitude = taskBasic?.globalRTHHeight ?? null

        // 获取设备位置作为起飞位置
        const flightLng = primaryDevice?.properties?.longitude ?? null
        const flightLat = primaryDevice?.properties?.latitude ?? null

        Object.assign(commonData, {
          templateId: airline.templateId,
          waylineTemplateId: airline.waylineTemplateId,
          taskTemplateInfo: {
            taskBasic: airline.taskBasic,
            defaultDeviceId: values.deviceIds,
            parameters: parameters,
          },
          // 添加飞行高度（航线中最高点的高度）
          ...(maxFlightAltitude != null && {
            flightAltitude: maxFlightAltitude,
          }),
          // 添加返航高度
          ...(returnAltitude != null && {
            returnAltitude,
          }),
          // 添加起飞位置
          ...(flightLng != null &&
            flightLat != null && {
              uavFlightLongitude: flightLng,
              uavFlightLatitude: flightLat,
            }),
          // 添加目标位置（航线最后一个航点）
          ...(lastWaypoint && {
            uavTargetLongitude: lastWaypoint.lng,
            uavTargetLatitude: lastWaypoint.lat,
          }),
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
      onSuccess?.()
    } finally {
      setConfirmLoading(false)
    }
  })

  useEffect(() => {
    if (!open || !defaultDeviceId) return
    form.setFieldValue(
      'deviceIds',
      allowMultipleDevice ? [defaultDeviceId] : defaultDeviceId,
    )
  }, [allowMultipleDevice, defaultDeviceId, form, open])

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
        confirmTitle="确定"
        confirmLoading={confirmLoading}
        centered
        width={400}
        onClose={handleClose}
        onConfirm={handleConfirm}
      >
        <Form form={form} layout="vertical" initialValues={{ flightType: 0 }}>
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
                  options={deviceOptionsForForm}
                  placeholder="选择设备"
                  optionFilterProp="deviceName"
                  showSearch
                  disabled={!!defaultDeviceId}
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
                  max={globalConfig.uavHeightLimit}
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
                  max={globalConfig.uavHeightLimit}
                  addonAfter={<span className="mx-1">m</span>}
                  placeholder="100m"
                />
              </Form.Item>
              <Form.Item label="目标经纬度" required>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Form.Item
                      name="uavTargetLongitude"
                      rules={[{ required: true, message: '请输入目标经度' }]}
                      noStyle
                    >
                      <InputNumber
                        className="w-full"
                        precision={6}
                        addonAfter={
                          <IconButton
                            className="mx-1"
                            tippyProps={{ content: '地图选点' }}
                            active={isPicking}
                            onClick={handlePickPosition}
                          >
                            <AimOutlined />
                          </IconButton>
                        }
                        placeholder="请输入或地图选点"
                      />
                    </Form.Item>
                  </div>
                  <div className="flex-1">
                    <Form.Item
                      name="uavTargetLatitude"
                      rules={[{ required: true, message: '请输入目标纬度' }]}
                      noStyle
                    >
                      <InputNumber
                        className="w-full"
                        precision={6}
                        addonAfter={
                          <IconButton
                            className="mx-1"
                            tippyProps={{ content: '地图选点' }}
                            active={isPicking}
                            onClick={handlePickPosition}
                          >
                            <AimOutlined />
                          </IconButton>
                        }
                        placeholder="请输入或地图选点"
                      />
                    </Form.Item>
                  </div>
                </div>
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
                    if (!defaultDeviceId) {
                      form.setFieldValue('deviceIds', undefined)
                    }
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
                  options={deviceOptionsForForm}
                  mode={allowMultipleDevice ? 'multiple' : undefined}
                  placeholder={t('action.detail.task.add.form.device.label')}
                  optionFilterProp="deviceName"
                  showSearch
                  disabled={!!defaultDeviceId}
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
              treeNodeFilterProp="title"
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
