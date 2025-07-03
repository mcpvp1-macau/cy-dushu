import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { GetProps, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

type FormModalProps = GetProps<typeof FormModal>

type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

/** 绘制飞行区域弹窗 */
const AddFlightAreaModal: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()

  const flightAreaGroupList = useFlightAreaStore((s) => s.flightAreaGroupList)
  const layerOptions = useMemo(
    () =>
      flightAreaGroupList.map((layer) => ({
        label: layer.layerName,
        value: layer.layerId,
      })),
    [flightAreaGroupList],
  )

  const overlayExtTypeOptions = [
    {
      label: t('flightArea.type.electronicFence.title'),
      value: 'ELECTRONIC_FENCE',
      info: t('flightArea.type.electronicFence.info'),
    },
    {
      label: t('flightArea.type.noFly.title'),
      value: 'NO_FLY_ZONE',
      info: t('flightArea.type.noFly.info'),
    },
    {
      label: t('flightArea.type.countZone.title'),
      value: 'AI_COUNT_ZONE',
      info: t('flightArea.type.countZone.info'),
    },
    {
      label: t('flightArea.type.noCountZone.title'),
      value: 'NO_COUNT_ZONE',
      info: t('flightArea.type.noCountZone.info'),
    },
  ]

  const items = useMemo(
    () =>
      [
        {
          label: t('flightArea.create.form.name'),
          name: 'overlayName',
          type: 'input',
          rules: [
            {
              required: true,
              message: t('overlay.marker.create.form.overlayName.required_msg'),
            },
          ],
        },
        {
          label: t('overlay.marker.create.form.layerId.title'),
          name: 'layerId',
          type: 'select',
          options: layerOptions,
          rules: [
            {
              required: true,
              message: t('overlay.marker.create.form.layerId.required_msg'),
            },
          ],
        },
        {
          label: t('flightArea.type.title'),
          name: 'overlayExtType',
          type: 'select',
          options: overlayExtTypeOptions,
          rules: [
            {
              required: true,
            },
          ],
          otherProps: {
            optionRender: (option, { index }) => {
              return (
                <div className="flex items-center gap-3">
                  <span>{option.label}</span>
                  <Tooltip title={overlayExtTypeOptions[index].info}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              )
            },
          },
        },
      ] as XFormItem[],
    [layerOptions],
  )

  return (
    <FormModal
      mask
      title={props.title ?? t('flightArea.create.title')}
      {...props}
      items={items}
    />
  )
})

AddFlightAreaModal.displayName = 'AddFlightAreaModal'

export default AddFlightAreaModal
