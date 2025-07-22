import type { ReactNode } from 'react'
import type { SelectProps, InputProps, RangePickerProps } from 'antd'

type CommonProps = {
  name: string
  placeholder?: string
  render?: ReactNode
  valuePropName?: string
}

export type XFormItem = CommonProps &
  (
    | {
        type: 'input'
        otherProps?: InputProps
      }
    | {
        type: 'select'
        options: { label: ReactNode; value: any }[]
        otherProps?: SelectProps<any>
      }
    | {
        type: 'date-range'
        otherProps?: RangePickerProps
      }
  )
