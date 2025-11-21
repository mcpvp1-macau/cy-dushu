import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useMapDrawStore from '@/store/map/useDraw.store'
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

  const drawingPointIcon = useMapDrawStore((s) => s.drawingPointIcon)

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
        drawingPointIcon === 'take_photo'
          ? {
              label: '上传图标',
              name: 'icon',
              type: 'upload',
              // render: () => <div className="flex items-center gap-2"></div>,
              otherProps: {
                accept: 'image/*',
                maxCount: 1,
                listType: 'picture-card',
                beforeUpload: (file: File) => {
                  return false // 阻止上传
                },
              },
            }
          : undefined,
      ].filter(Boolean) as XFormItem[],
    [layerOptions, drawingPointIcon],
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
