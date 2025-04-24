import { shouldJson } from '@/utils/json'
import { Form, GetProps } from 'antd'
import { useDeepCompareEffect, useMemoizedFn } from 'ahooks'
import { XFormItem } from '@/components/XForm/types'
import { algorithmIconMap } from './AlgorithmListItem'
import XModal from '@/components/XModal'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import AppEmpty from '@/components/AppEmpty'
import XForm from '@/components/XForm'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import VideoAreaPicker from './VideoAreaPicker'

type PropsType = {
  open: boolean
  aiData: API_Alogrithm.domain.AlgorithmRecord
  /** 算法配置 */
  alogorithmConfig?: Record<string, any>
  areaPickervideoInfo?: GetProps<typeof VideoAreaPicker>['videoInfo']
  onClose?: () => void
  onConfirm?: (value: any) => void
}

const AlgorithmSettingModal: FC<PropsType> = memo(
  ({
    open,
    aiData,
    alogorithmConfig,
    areaPickervideoInfo,
    onClose,
    onConfirm,
  }) => {
    const { t } = useTranslation()
    const { algorithmConfigList } = aiData

    const overlay = useMapLayerAndOverlayStore((s) => s.overlayList)
    const overlayOptions = useMemo(
      () =>
        overlay
          .filter(
            (e) => e.overlayType === 'POLYGON' || e.overlayType === 'CIRCLE',
          )
          .map((e) => ({
            label: e.overlayName,
            value: e.overlayId,
          })),
      [overlay],
    )

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
            const enums = shouldJson<any[]>(e.valueEnums) ?? []
            item = {
              name: e.property,
              label: e.propertyName,
              type: (enums.length ?? 0) > 3 ? 'select' : 'radio',
              options: enums.map((v: any) => ({
                label: v.name,
                value: v.type,
              })),
            }
          } else if (e.valueType === 'checkbox') {
            const enums = shouldJson<any[]>(e.valueEnums) ?? []
            if ((enums?.length ?? 0) > 3) {
              item = {
                name: e.property,
                label: e.propertyName,
                type: 'select',
                options: enums!.map((v: any) => ({
                  label: v.name,
                  value: v.type,
                })),
                otherProps: {
                  mode: 'multiple',
                  maxTagCount: 'responsive',
                },
              }
            } else {
              item = {
                name: e.property,
                label: e.propertyName,
                type: 'checkbox',
                options:
                  enums?.map((v: any) => ({
                    label: v.name,
                    value: v.type,
                  })) ?? [],
              }
            }
          } else if (
            e.valueType === 'videoxyPositions' ||
            e.property === 'videoxyPositions'
          ) {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'input',
            }
            item.render = (
              <VideoAreaPicker
                filedName={e.property}
                videoInfo={areaPickervideoInfo}
              />
            )
          } else if (e.valueType === 'lnglatPositions') {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'select',
              options: overlayOptions,
              otherProps: {
                mode: 'multiple',
                maxTagCount: 'responsive',
              },
            }
          } else {
            item = {
              name: e.property,
              label: e.propertyName,
              type: 'input',
            }
          }
          if (e.valueTip) {
            item.tooltip = e.valueTip
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
      [algorithmConfigList, overlayOptions],
    )

    const [form] = Form.useForm()

    const envMap = shouldJson(aiData.envMap)

    const Icon = algorithmIconMap[envMap?.icon as string]

    const handleConfirm = useMemoizedFn(() => {
      const data = form.getFieldsValue()

      // 处理地图选区
      const hasMapArea = !!algorithmConfigList.find(
        ({ valueType }) => valueType === 'lnglatPositions',
      )
      if (hasMapArea) {
        const map = new Map(overlay.map((e) => [e.overlayId, e]))
        algorithmConfigList.forEach((e) => {
          if (e.valueType === 'lnglatPositions') {
            data[e.property] = data[e.property].map((v: number) => {
              const overlay = map.get(v)
              if (!overlay) {
                return {
                  type: 'INVALID',
                  geometryData: [],
                }
              }
              const position = shouldJson(overlay.overlayPositions)
              if (!Array.isArray(position)) {
                return {
                  type: 'INVALID',
                  geometryData: [],
                }
              }
              if (overlay.overlayType === 'CIRCULAR') {
                return {
                  overlayId: overlay.overlayId,
                  type: 'CIRCULAR',
                  geometryData: {
                    center: [position[0][0], position[0][1]],
                    radius: position[0].at(-1),
                  },
                }
              }
              return {
                overlayId: overlay.overlayId,
                type: overlay.overlayType,
                geometryData: shouldJson(overlay.overlayPositions),
              }
            })
          }
        })
      }

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

      const set = new Set(overlayOptions.map((e) => e.value))

      algorithmConfigList.forEach((e) => {
        if (e.valueType === 'lnglatPositions') {
          value[e.property] = shouldJson(alogorithmConfig[e.property])
            ?.map((v: any) => v.overlayId)
            ?.filter((v: any) => set.has(v))
        }
      })

      form.setFieldsValue(value)
    }, [alogorithmConfig])

    return (
      <XModal
        width={600}
        title={
          <div className="flex gap-2">
            <IconSetting />
            <span>{t('device.algorithm.aiModelSetting.title')}</span>
          </div>
        }
        open={open}
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="bg-[#16202B] p-3 mb-3">
          <div className="flex gap-2">
            <Icon className="text-fore" />
            <span>{aiData.name}</span>
          </div>
          <div className="mt-3 border border-solid border-gray-700 rounded-[3px] p-2 flex text-fore text-sm">
            <div className="grow">
              <div>{t('device.algorithm.deviceCountofDeployed.title')}</div>
              <div className="text-white">{aiData.deviceCount}</div>
            </div>
            <div className="grow">
              <div>{t('common.source')}</div>
              <div className="text-white">{envMap['from'] || '-'}</div>
            </div>
            <div className="grow">
              <div>{t('common.createTime')}</div>
              <div className="text-white">{aiData.createTime}</div>
            </div>
            <div className="grow">
              <div>{t('common.version')}</div>
              <div className="text-white">{envMap['version'] || '-'}</div>
            </div>
          </div>
          <div className="mt-3 border border-solid border-gray-700 rounded-[3px] p-2">
            {formItems.length === 0 ? (
              <AppEmpty
                description={t('device.algorithm.emptyConfig.description')}
              />
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
