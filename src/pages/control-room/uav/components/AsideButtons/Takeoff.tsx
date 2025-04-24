import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import FormModal from '@/components/XForm/Modal'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useIdleControlTag from '../../hooks/useIdleControlTag'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

/** 一键起飞 */
const Takeoff: FC<PropsType> = memo(({ postServiceFn }) => {
  const { t } = useTranslation()
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const idleControlTag = useIdleControlTag()
  const hasService = useDeviceDetailStore((s) => s.serviceHave['takeoff'])

  const canTakeoff =
    !isLimitedFly && (idleControlTag || hasControlPower) && hasService

  const handleClick = async (data) => {
    await postServiceFn('takeoff', data)
    setFalse()
  }

  const [open, { setTrue, setFalse }] = useBoolean(false)

  return (
    <>
      <VerticalIconButton
        className="flex-1 h-11 p-1 text-xs"
        disabled={!canTakeoff}
        icon={<IconTakeoff className="text-base" />}
        onClick={setTrue}
      >
        {t('controlRoom.uav.service.takeoff.title')}
      </VerticalIconButton>
      {open && (
        <FormModal
          title="一键起飞"
          initialValues={{ height: 100 }}
          items={[
            {
              label: '起飞高度',
              name: 'height',
              type: 'input-number',
              rules: [{ required: true, message: '请输入起飞高度' }],
              otherProps: {
                addonAfter: 'm',
                min: 1,
                max: globalConfig.uavHeightLimit,
              },
            },
            {
              label: t('device.uav.takeoffForm.goHomeAltitude.title'),
              name: 'gohomeAltitude',
              type: 'input-number',
              otherProps: {
                addonAfter: 'm',
                min: 50,
                max: globalConfig.uavHeightLimit,
              },
            },
          ]}
          onClose={setFalse}
          onConfirm={handleClick}
        />
      )}
    </>
  )
})

Takeoff.displayName = 'Takeoff'

export default Takeoff
