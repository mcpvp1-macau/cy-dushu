import { FormItemProps, RadioGroupProps } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';

export enum FilterPopoverFormType {
  /**
   * 独立的表单
   */
  Independent = 'independent',
  /**
   * 嵌套的表单
   */
  Nested = 'nested',
}

export enum GroupType {
  RadioGroup = 'radioGroup',
  CheckboxGroup = 'checkboxGroup',
}

type RadioItem = Required<RadioGroupProps>['options'][number];
type CheckboxItem = Required<CheckboxGroupProps>['options'][number];

export type RadioGroupItem = {
  items: RadioItem[];
  type: GroupType.RadioGroup;
  props?: RadioGroupProps;
};

export type CheckboxGroupItem = {
  items: CheckboxItem[];
  type: GroupType.CheckboxGroup;
  props?: CheckboxGroupProps;
};

export type GroupItem = RadioGroupItem | CheckboxGroupItem;

export type Group = {
  name: string;
  label: string;
  rules?: FormItemProps['rules'];
} & GroupItem;
