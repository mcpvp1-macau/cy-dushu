import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { GetProps, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

type FormModalProps = GetProps<typeof FormModal>

type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

const AddFormModal: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const layerList = useMapLayerAndOverlayStore((s) => s.layerList)
  const layerOptions = useMemo(
    () =>
      layerList.map((layer) => ({
        label: layer.layerName,
        value: layer.layerId,
      })),
    [layerList],
  )

  const overlayExtTypeOptions = [
    {
      label: t('overlay.type.normal.title'),
      value: '',
      info: t('overlay.type.normal.info'),
    },
    {
      label: t('overlay.type.electronicFence.title'),
      value: 'ELECTRONIC_FENCE',
      info: t('overlay.type.electronicFence.info'),
    },
    {
      label: t('overlay.type.noFly.title'),
      value: 'NO_FLY_ZONE',
      info: t('overlay.type.noFly.info'),
    },
    {
      label: t('overlay.type.countZone.title'),
      value: 'AI_COUNT_ZONE',
      info: t('overlay.type.countZone.info'),
    },
    {
      label: t('overlay.type.noCountZone.title'),
      value: 'NO_COUNT_ZONE',
      info: t('overlay.type.noCountZone.info'),
    },
  ]

  const items = useMemo(
    () =>
      [
        {
          label: t('overlay.marker.create.form.overlayName.title'),
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
          label: t('overlay.type.title'),
          name: 'overlayExtType',
          type: 'select',
          options: overlayExtTypeOptions,
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
            defaultValue: '',
          },
        },
      ] as XFormItem[],
    [layerOptions],
  )

  return (
    <FormModal
      mask
      title={props.title ?? t('overlay.drawing.create.title')}
      {...props}
      items={items}
    />
  )
})

AddFormModal.displayName = 'AddFormModal'

export default AddFormModal
