import { XFormItem } from './types'
import {
  Button,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  GetProps,
  Input,
  InputNumber,
  Radio,
  Row,
  ThemeConfig,
  TreeSelect,
  Upload,
} from 'antd'
import { CaretDownFilled, UploadOutlined } from '@ant-design/icons'
import AliyunOSSUpload from './AliyunOSSUpload'
import styles from './styles.module.less'
import Select from '../AntdOverride/Select'

type PropsType = GetProps<typeof Form> & {
  items: XFormItem[]
  themeKey?: string
  themeConfig?: NonNullable<ThemeConfig['components']>['Form']
  rowsProps?: GetProps<typeof Row>
  colsProps?: GetProps<typeof Col>
}

/** 表单 */
const XForm: FC<PropsType> = memo(
  ({
    items,
    rowsProps,
    themeKey = 'dushu',
    themeConfig = {},
    colsProps,
    ...restProps
  }) => {
    const { t } = useTranslation()

    // 处理 items
    const renderItems = items.map((item) => {
      if (item.render) return item
      const newItem = { ...item }
      switch (item.type) {
        case 'input':
          newItem.render = (
            <Input
              placeholder={item.placeholder ?? t('common.form.pleaseInput')}
              {...item.otherProps}
            />
          )
          break
        case 'input-number':
          newItem.render = (
            <InputNumber
              placeholder={item.placeholder ?? t('common.form.pleaseInput')}
              {...item.otherProps}
              className={clsx('w-full', item.otherProps?.className)}
            />
          )
          break
        case 'textarea':
          newItem.render = (
            <Input.TextArea
              placeholder={item.placeholder ?? t('common.form.pleaseInput')}
              {...item.otherProps}
            />
          )
          break
        case 'select':
          newItem.render = (
            <Select
              placeholder={item.placeholder ?? t('common.form.pleaseSelect')}
              options={item.options}
              showSearch={true}
              optionFilterProp="label"
              {...item.otherProps}
            />
          )
          break
        case 'tree-select':
          newItem.render = (
            <TreeSelect
              placeholder={item.placeholder ?? t('common.form.pleaseSelect')}
              treeData={item.treeData}
              treeExpandAction={'click'}
              treeNodeFilterProp={'label'}
              showSearch={true}
              suffixIcon={<CaretDownFilled style={{ pointerEvents: 'none' }} />}
              filterTreeNode={(input, node) => {
                if (typeof node.label !== 'string') return true
                return node.label?.indexOf(input) !== -1
              }}
              {...item.otherProps}
            />
          )
          break
        case 'upload':
          newItem.render = (
            <Upload {...item.otherProps}>
              <Button style={{ display: 'block', width: '100%' }}>
                <UploadOutlined className="mr-2" />
                {t('common.upload')}
              </Button>
            </Upload>
          )
          break
        case 'upload-minio':
          newItem.render = (
            <AliyunOSSUpload
              otherProps={item.otherProps}
              getPath={item.getPath}
              filesFilter={item.filesFilter}
              appendPath={item.appendPath}
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'rgba(0,0,0,0)',
                }}
              >
                {t('common.upload')}
              </Button>
            </AliyunOSSUpload>
          )
          break
        case 'date':
          newItem.render = <DatePicker {...item.otherProps} />
          break
        case 'radio':
          newItem.render = (
            <Radio.Group options={item.options} {...item.otherProps} />
          )
          break
        case 'checkbox':
          newItem.render = (
            <Checkbox.Group options={item.options} {...item.otherProps} />
          )
          break
        default:
          const _: never = item // 这里不要删掉, 用 ts 检查
          console.warn(_, 'Unknown XForm type')
      }
      return newItem
    })

    themeConfig.itemMarginBottom ??= 12

    return (
      <ConfigProvider
        theme={{
          cssVar: {
            key: themeKey,
          },
          hashed: false,
          components: {
            Form: themeConfig,
          },
        }}
      >
        <Form
          {...restProps}
          className={clsx(styles['liqun-form'], restProps.className)}
        >
          <Row {...rowsProps}>
            {renderItems.map((item) => (
              <Col
                key={item.name}
                {...(item.colsProps ??
                  colsProps ?? {
                    span: 24,
                  })}
              >
                <Form.Item
                  key={item.name}
                  label={item.label}
                  name={item.name}
                  rules={item.rules}
                  valuePropName={item.valuePropName}
                  getValueFromEvent={item.getValueFromEvent}
                  tooltip={item.tooltip}
                >
                  {item.render}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </ConfigProvider>
    )
  },
)

XForm.displayName = 'XForm'

export default XForm

export const useXFormInject = (
  formItems: XFormItem[],
  { deps, actions }: { deps: any[]; actions: ((fi: XFormItem) => XFormItem)[] },
) => {
  const [formItemsState, setFormItemsState] = useState(formItems)

  useMemo(() => {
    for (const action of actions) {
      setFormItemsState((prev) => prev.map((fi) => action(fi)))
    }
  }, deps)

  return formItemsState
}
