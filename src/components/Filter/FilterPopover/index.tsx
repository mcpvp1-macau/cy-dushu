import { Checkbox, Form, FormProps, Radio } from 'antd'
import React, { ComponentProps } from 'react'
// import FilterIcon from '../../Icon/FilterIcon';
import { FilterPopoverFormType, Group, GroupType } from './interface'
import Title from '../../Title'
import IconButtonWithDropDownDialog from '@/components/ui/button/IconButtonWithDropDownDialog'
import IconFilter from '@/assets/icons/jsx/IconFilter'

type DialogProps = Omit<
  ComponentProps<typeof IconButtonWithDropDownDialog>,
  'title' | 'popupRender'
>

export interface FilterPopoverProps {
  /** 标题 */
  title: React.ReactNode
  /** 数据组 */
  groups: Group[]
  /** 筛选弹窗的类型（是否是独立的 antd-form 标签）*/
  type?: FilterPopoverFormType
  /** 弹窗的 props */
  props?: DialogProps
  /** antd-form 的 props */
  formProps?: FormProps
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  title,
  groups,
  type = FilterPopoverFormType.Nested,
  props = {},
  formProps = {},
}) => {
  /** 渲染每组数据 */
  const renderGroupItem = (group: Group) => {
    if (group.type === GroupType.RadioGroup) {
      return <Radio.Group {...group.props} options={group.items} />
    } else if (group.type === GroupType.CheckboxGroup) {
      return <Checkbox.Group {...group.props} options={group.items} />
    } else {
      return null
    }
  }

  /** 渲染所有数据 */
  const renderGroups = () => {
    return groups.map((group) => {
      return (
        <Form.Item
          key={group.name}
          name={group.name}
          label={<Title bar>{group.label}</Title>}
          labelCol={{ span: 24 }}
        >
          {renderGroupItem(group)}
        </Form.Item>
      )
    })
  }

  return (
    <IconButtonWithDropDownDialog
      title={title}
      trigger={props?.trigger ?? ['click']}
      {...props}
      popupRender={() => (
        <div className="w-[300px] p-3">
          {type === FilterPopoverFormType.Independent && (
            <Form {...formProps}>{renderGroups()}</Form>
          )}
          {type === FilterPopoverFormType.Nested && renderGroups()}
        </div>
      )}
    >
      <IconFilter />
    </IconButtonWithDropDownDialog>
  )
}

export default FilterPopover
