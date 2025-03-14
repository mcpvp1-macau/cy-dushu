import { Button, ConfigProvider, Form, GetProps, Modal } from 'antd'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import styles from '@/components/XForm/Modal/index.module.less'

type FormModalProps = GetProps<typeof FormModal>
type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'> & {
    onSuccess?: () => void
  }

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
            defaultValue: 200,
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
            defaultValue: 60,
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
            defaultValue: 200,
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
          otherProps: {
            defaultValue: 'goBack',
            options: [
              { value: 'goBack', label: '返航' },
              { value: 'hover', label: '悬停' },
            ],
          },
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
    // <Modal
    //   open={props.open}
    //   closable={false}
    //   footer={null}
    //   centered
    //   width={'318px'}
    // >
    //   <div className={styles.addModal}>
    //     <div className="header">
    //       <div className="text-white">
    //         {t('controlRoom.uav.service.reconstruction.setting.title')}
    //       </div>
    //       <IconButton style={{ height: '20px' }} onClick={props.onClose}>
    //         <IconClose style={{ fontSize: '20px' }} />
    //       </IconButton>
    //     </div>

    //   </div>
    // </Modal>
    <FormModal
      title={t('controlRoom.uav.service.reconstruction.setting.title')}
      {...props}
      items={items}
    ></FormModal>
  )
}

ReconstructionSettingModal.displayName = 'ReconstructionSettingModal'

export default ReconstructionSettingModal
