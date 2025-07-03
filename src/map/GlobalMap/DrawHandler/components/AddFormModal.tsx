import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { GetProps } from 'antd'

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
