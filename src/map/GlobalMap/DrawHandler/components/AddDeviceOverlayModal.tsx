import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useMapDrawStore from '@/store/map/useDraw.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { GetProps } from 'antd'

type FormModalProps = GetProps<typeof FormModal>

type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

const AddDeviceOverlayFormModal: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const bindingDeviceId = useMapDrawStore((s) => s.bindingDeviceId)

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

  const deviceName = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[bindingDeviceId].deviceName,
  )

  return (
    <FormModal
      mask
      title={props.title ?? t('overlay.drawing.create.title')}
      {...props}
      initialValues={{
        overlayName: `${deviceName} - 可飞行区域`,
      }}
      items={items}
    />
  )
})

AddDeviceOverlayFormModal.displayName = 'AddFormModal'

export default AddDeviceOverlayFormModal
