import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { DeviceEnum } from '@/enum/device'
import { useWaylineAndDeviceFormOptions } from '@/hooks/device/useWaylineOptions'
import { createActionItem } from '@/service/modules/action-item'
import { useMemoizedFn } from 'ahooks'
import { Form, FormInstance } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { TFunction } from 'i18next'
import { pick } from 'lodash'

type PropsType = {
  actionId: number
  openTriggerKey?: number
  onSuccess?: () => void
  defaultDeviceId?: string
}

type Option = {
  label: ReactNode
  value: any
}

const createTaskConfig = (
  t: TFunction,
  waylineTemplateOptions: Option[],
  deviceOptions: Option[],
  allowMultipleDevice: boolean,
  form: FormInstance<{ deviceIds: string | string[] }>,
  fixedDeviceId?: string,
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
      name: 'waylineTemplateId',
      type: 'select',
      options: waylineTemplateOptions,
      otherProps: {
        optionFilterProp: 'name',
        allowClear: true,
        onChange: () => {
          if (!fixedDeviceId) {
            form.setFieldValue('deviceIds', undefined)
          }
        },
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
        disabled: !!fixedDeviceId,
      },
      rules: [
        {
          required: true,
          message: t('action.detail.task.add.form.device.required_msg'),
        },
      ],
    },
  ] as XFormItem[]

/** 添加子任务 */
const AddTask: FC<PropsType> = memo(
  ({ actionId, openTriggerKey, onSuccess, defaultDeviceId }) => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (openTriggerKey) {
        setOpen(true)
      }
    }, [openTriggerKey])

    const queryClient = useQueryClient()
    const { t, i18n } = useTranslation()

    const [form] = Form.useForm()

    const {
      waylineOptions,
      deviceOptions,
      allDevices,
      allowMultipleDevice,
      holder,
      activeWayline,
      findWaylineByTemplateId,
    } = useWaylineAndDeviceFormOptions(form)

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

    useEffect(() => {
      if (!open || !defaultDeviceId) return
      form.setFieldValue(
        'deviceIds',
        allowMultipleDevice ? [defaultDeviceId] : defaultDeviceId,
      )
    }, [allowMultipleDevice, defaultDeviceId, form, open])

    const [confirmLoading, setConfirmLoading] = useState(false)
    const handleConfirm = useMemoizedFn(async (val: any) => {
      const wayline =
        activeWayline || findWaylineByTemplateId(val.waylineTemplateId)
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
        actionId,
        deviceType,
      }
      if (wayline) {
        data['templateId'] = wayline.templateId
        data['waylineTemplateId'] = wayline.waylineTemplateId
        data['taskTemplateInfo'] = {
          taskBasic: wayline.taskBasic,
          defaultDeviceId: val.deviceIds,
          parameters: JSON.parse(wayline.parameters),
        }
      }
      setConfirmLoading(true)
      try {
        await createActionItem(data)
        setOpen(false)
        await queryClient.invalidateQueries({
          queryKey: ['action', actionId, 'items'],
        })
        form.resetFields()
        onSuccess?.()
      } finally {
        setConfirmLoading(false)
      }
    })

    const formItems = useMemo(
      () =>
        createTaskConfig(
          t,
          waylineOptions,
          deviceOptionsForForm,
          allowMultipleDevice,
          form,
          defaultDeviceId,
        ),
      [
        i18n.language,
        waylineOptions,
        deviceOptionsForForm,
        allowMultipleDevice,
        form,
        defaultDeviceId,
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
            form.resetFields()
          }}
          onConfirm={handleConfirm}
        />
        {holder}
      </div>
    )
  },
)

AddTask.displayName = 'AddTask'

export default AddTask
