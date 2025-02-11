import { Checkbox, Form, FormProps, Popover, PopoverProps, Radio } from 'antd'
import React, { useState } from 'react'
// import FilterIcon from '../../Icon/FilterIcon';
import { FilterPopoverFormType, Group, GroupType } from './interface'
import styles from './index.module.less'
import Title from '../../Title'
// import { CloseIcon } from '../../Icon';
import IconButton from '@/components/ui/button/IconButton'
import classNames from 'clsx'
import Icon from '@/components/Icon/index'

export interface FilterPopoverProps {
  /** 标题 */
  title: React.ReactNode
  /** 数据组 */
  groups: Group[]
  /** 筛选弹窗的类型（是否是独立的 antd-form 标签）*/
  type?: FilterPopoverFormType
  /** antd-popover 的 props */
  props?: PopoverProps
  /** antd-form 的 props */
  formProps?: FormProps
  initOpen?: boolean
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  title,
  groups,
  type = FilterPopoverFormType.Nested,
  props = {},
  formProps = {},
  initOpen = false,
}) => {
  const [open, setOpen] = useState(initOpen)

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
    <Popover
      placement="bottom"
      trigger={['click']}
      {...props}
      open={open}
      rootClassName={styles.popover}
      title={
        <div className="header">
          <div className="title">{title}</div>
          <IconButton
            style={{ height: '20px' }}
            onClick={() => {
              setOpen(false)
            }}
          >
            {/* <CloseIcon style={{ fontSize: '20px' }} /> */}
            <Icon id="icon-guanbi" />
          </IconButton>
        </div>
      }
      content={
        <div className="content">
          {type === FilterPopoverFormType.Independent && (
            <Form {...formProps}>{renderGroups()}</Form>
          )}
          {type === FilterPopoverFormType.Nested && renderGroups()}
        </div>
      }
    >
      <Icon
        id="icon-filter-list"
        className={classNames(styles.icon, open ? styles.open : '')}
        onClick={() => {
          setOpen((value) => !value)
        }}
      />
    </Popover>
  )
}

export default FilterPopover
