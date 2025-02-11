import type { ReactNode } from 'react';
import type {
  SelectProps,
  InputProps,
  UploadProps,
  TreeSelectProps,
  InputNumberProps,
  RangePickerProps,
} from 'antd';
import type { Rule } from 'antd/es/form';

type CommonProps = {
  name: string;
  placeholder?: string;
  render?: ReactNode;
  valuePropName?: string;
};

export type XFormItem = CommonProps &
  (
    | {
        type: 'input';
        otherProps?: InputProps;
      }
    | {
        type: 'select';
        options: { label: ReactNode; value: any }[];
        otherProps?: SelectProps<any>;
      }
    | {
        type: 'date-range';
        otherProps?: RangePickerProps;
      }
  );
