import { XFormItem } from '@/components/XForm/types'

export const createExecuteFormItems = () =>
  [
    {
      label: '设备',
      name: 'deviceId',
      type: 'select',
      options: [],
      rules: [{ required: true, message: '请选择设备' }],
    },
  ] as XFormItem[]
