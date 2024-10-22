import type { ReactNode } from 'react'
import type {
  SelectProps,
  InputProps,
  UploadProps,
  TreeSelectProps,
  InputNumberProps,
  GetProps,
  RadioGroupProps,
  Col,
  Checkbox,
  DefaultOptionType,
} from 'antd'
import type { Rule } from 'antd/es/form'

type CommonProps = {
  name: string
  label: string
  placeholder?: string
  render?: ReactNode
  rules?: Rule[]
  valuePropName?: string
  getValueFromEvent?: (...args: any[]) => any
  colsProps?: GetProps<typeof Col>
}

export type XFormItem = CommonProps &
  (
    | {
        type: 'input'
        otherProps?: InputProps
      }
    | {
        type: 'select'
        options: DefaultOptionType[]
        otherProps?: SelectProps<any>
      }
    | {
        type: 'upload'
        otherProps?: UploadProps
      }
    | {
        type: 'upload-minio'
        otherProps?: UploadProps
      }
    | {
        type: 'textarea'
        otherProps?: TextAreaProps
      }
    | {
        type: 'tree-select'
        treeData: TreeSelectProps<any>['treeData']
        otherProps?: TreeSelectProps<any>
      }
    | {
        type: 'input-number'
        otherProps?: InputNumberProps
      }
    | {
        type: 'date'
        otherProps?: DatePickerProps
      }
    | {
        type: 'radio'
        options: DefaultOptionType[]
        otherProps?: RadioGroupProps
      }
    | {
        type: 'checkbox'
        options: DefaultOptionType[]
        otherProps?: GetProps<typeof Checkbox.Group>
      }
  )
