import { Flex, Form, Input, Select } from 'antd'
import locale from 'antd/es/date-picker/locale/zh_CN'
import FilterPopover, { FilterPopoverProps } from './FilterPopover'
import { XFormItem } from './types'
import DateRangePicker from '../AntdOverride/DateRangePicker'

interface FilterProps {
  onChange: (values: any) => void
  popover: FilterPopoverProps
  items: XFormItem[]
  initValues?: any
  buttons?: JSX.Element | JSX.Element[]
}

const Filter = ({
  onChange,
  popover,
  items = [],
  initValues = {},
  buttons = <></>,
}: FilterProps) => {
  const [form] = Form.useForm()

  // useEffect(() => {
  //   form.setFieldsValue(initValues);
  // }, [initValues]);

  // 处理 items
  const renderItems = items.map((item) => {
    if (item.render) return item
    const newItem = { ...item }
    switch (item.type) {
      case 'input':
        newItem.render = (
          <Input
            placeholder={item.placeholder ?? '请输入'}
            {...item.otherProps}
            autoComplete="off"
          />
        )
        break
      case 'date-range':
        newItem.render = (
          <DateRangePicker
            placeholder={item.placeholder ?? '请输入'}
            format="MM-DD HH:mm:ss"
            showTime
            allowClear
            locale={locale}
            {...item.otherProps}
          />
        )
        break
      case 'select':
        newItem.render = (
          <Select
            placeholder={item.placeholder ?? '请选择'}
            options={item.options}
            showSearch={true}
            optionFilterProp="label"
            {...item.otherProps}
          />
        )
        break
    }
    return newItem
  })
  const lastRender = renderItems.splice(-1, 1)[0]

  return (
    <Form
      form={form}
      style={{ width: '100%' }}
      layout="inline"
      onValuesChange={(_, values) => {
        onChange({
          ...initValues,
          ...values,
        })
      }}
      initialValues={initValues}
      className="mt-[10px]"
    >
      {renderItems.map((item) => (
        <Form.Item
          key={item.name}
          name={item.name}
          valuePropName={item.valuePropName}
        >
          {item.render}
        </Form.Item>
      ))}
      <Flex gap={12} style={{ width: '100%' }}>
        <Form.Item name={lastRender.name} noStyle>
          {lastRender.render}
        </Form.Item>
        {buttons}
        <FilterPopover {...popover} />
      </Flex>
    </Form>
  )
}

export default Filter
