import { shouldJson } from '@/utils/json'
import { Form } from 'antd'
import { useDeepCompareEffect, useMemoizedFn } from 'ahooks'
import { XFormItem } from '@/components/XForm/types'
import { algorithmIconMap } from './AlgorithmListItem'
import XModal from '@/components/XModal'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import AppEmpty from '@/components/AppEmpty'
import XForm from '@/components/XForm'

type PropsType = {
  open: boolean
  aiData: API_Alogrithm.domain.AlgorithmRecord
  /** 算法配置 */
  alogorithmConfig?: Record<string, any>
  onClose?: () => void
  onConfirm?: (value: any) => void
}

const AlgorithmSettingModal: FC<PropsType> = memo(
  ({ open, aiData, alogorithmConfig, onClose, onConfirm }) => {
    const { algorithmConfigList } = aiData
    const formItems = useMemo<XFormItem[]>(
      () =>
        algorithmConfigList.map((e) => {
          let item: XFormItem
          if (e.valueType === 'number') {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'input-number',
              otherProps: {
                min: e.valueMin ?? undefined,
                max: e.valueMax ?? undefined,
                step: e.valueStep ?? 1,
              },
            }
          } else if (e.valueType === 'select') {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'select',
              options: shouldJson(e.valueEnums)?.map((v: any) => ({
                label: v.name,
                value: v.type,
              })),
            }
          } else if (e.valueType === 'radio') {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'radio',
              options: e.valueEnums.map((v: any) => ({
                label: v.name,
                value: v.type,
              })),
            }
          } else if (e.valueType === 'checkbox') {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'checkbox',
              options: shouldJson(e.valueEnums)?.map((v: any) => ({
                label: v.name,
                value: v.type,
              })),
            }
          } else {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'input',
            }
          }

          if (e.required) {
            item.rules ??= []
            item.rules.push({
              required: true,
              message: '请输入' + e.propertyName,
            })
          }
          return item
        }),
      [algorithmConfigList],
    )

    const [form] = Form.useForm()

    const envMap = shouldJson(aiData.envMap)

    const Icon = algorithmIconMap[envMap?.icon as string]

    const handleConfirm = useMemoizedFn(() => {
      const data = form.getFieldsValue()
      onConfirm?.(data)
    })

    useDeepCompareEffect(() => {
      // 重置表单
      if (!alogorithmConfig) {
        form.resetFields()
        return
      }
      // 设置表单值
      const value = { ...(alogorithmConfig ?? {}) }

      form.setFieldsValue(value)
    }, [alogorithmConfig])

    return (
      <XModal
        width={600}
        title={
          <div className="flex gap-2">
            <IconSetting />
            <span>AI 模型配置</span>
          </div>
        }
        open={open}
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="bg-[#16202B] p-3 mb-3">
          <div className="flex gap-2">
            <Icon />
            <span>{aiData.name}</span>
          </div>
          <div className="mt-3 border border-solid border-gray-700 rounded-[3px] p-2 flex text-fore text-sm">
            <div className="grow">
              <div>已部署设备数量</div>
              <div className="text-white">{aiData.deviceCount}</div>
            </div>
            <div className="grow">
              <div>来源</div>
              <div className="text-white">{envMap['from'] || '-'}</div>
            </div>
            <div className="grow">
              <div>创建时间</div>
              <div className="text-white">{aiData.createTime}</div>
            </div>
            <div className="grow">
              <div>版本</div>
              <div className="text-white">{envMap['version'] || '-'}</div>
            </div>
          </div>
          <div className="mt-3 border border-solid border-gray-700 rounded-[3px] p-2">
            {formItems.length === 0 ? (
              <AppEmpty description="该算法暂无配置项" />
            ) : (
              <XForm
                form={form}
                items={formItems}
                layout="vertical"
                colsProps={{ span: 12 }}
                rowsProps={{ gutter: 12 }}
              />
            )}
          </div>
        </div>
      </XModal>
    )
  },
)

AlgorithmSettingModal.displayName = 'AlgorithmnSettingModal'

export default AlgorithmSettingModal
