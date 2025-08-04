import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { GetProps } from 'antd'

type FormModalProps = GetProps<typeof FormModal>

type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

const AddDeviceOverlayFormModal: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()

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
      ] as XFormItem[],
    [],
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

AddDeviceOverlayFormModal.displayName = 'AddFormModal'

export default AddDeviceOverlayFormModal
