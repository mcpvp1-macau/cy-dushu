import { GetProps } from 'antd'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'

type FormModalProps = GetProps<typeof FormModal>
type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

const ReconstructionSettingModal: FC<PropsType> = (props) => {
  const { t } = useTranslation()

  const items = useMemo(
    () =>
      [
        {
          label: t(
            'controlRoom.uav.service.reconstruction.setting.flightAltitude',
          ),
          name: 'flightAltitude',
          type: 'input-number',
          otherProps: {
            suffix: 'm',
            min: 10,
            max: 500,
          },
          rules: [
            {
              required: true,
            },
          ],
        },
        {
          label: t(
            'controlRoom.uav.service.reconstruction.setting.overlapRate',
          ),
          name: 'overlapRate',
          type: 'input-number',
          otherProps: {
            suffix: '%',
            min: 0,
            max: 90,
          },
          rules: [
            {
              required: true,
            },
          ],
        },
        {
          label: t(
            'controlRoom.uav.service.reconstruction.setting.returnAltitude',
          ),
          name: 'returnAltitude',
          type: 'input-number',
          otherProps: {
            suffix: 'm',
            min: 1,
            max: 500,
          },
          rules: [
            {
              required: true,
            },
          ],
        },
        {
          label: t(
            'controlRoom.uav.service.reconstruction.setting.taskCompletionAction',
          ),
          name: 'taskCompletionAction',
          type: 'select',
          options: [
            { value: 'goBack', label: '返航' },
            { value: 'hover', label: '悬停' },
          ],
          rules: [
            {
              required: true,
            },
          ],
        },
      ] as XFormItem[],
    [],
  )

  return (
    <FormModal
      title={t('controlRoom.uav.service.reconstruction.setting.title')}
      {...props}
      initialValues={
        {
          flightAltitude: 200,
          overlapRate: 60,
          returnAltitude: 200,
          taskCompletionAction: 'goBack',
        } as any
      }
      items={items}
    ></FormModal>
  )
}

ReconstructionSettingModal.displayName = 'ReconstructionSettingModal'

export default ReconstructionSettingModal
