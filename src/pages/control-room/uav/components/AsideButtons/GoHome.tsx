import IconReturnBase from '@/assets/icons/jsx/uav/IconReturnBase'
import ServiceButton from './ServiceButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import FormModal from '@/components/XForm/Modal'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

const GoHome: FC<PropsType> = memo(({ postServiceFn }) => {
  const [t] = useTranslation()

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const canGohome = serviceHave['gohome']

  const multiDockMap = useUavControlRoomStore((s) => s.state.multiDockMap)

  const [open, setOpen] = useState(false)

  const [options, setOptions] = useState<{ label: string; value: string }[]>([])

  const handleClick = async () => {
    if (
      multiDockMap &&
      [
        'landingDockId',
        'landingDockSn',
        'takeoffDockId',
        'takeoffDockSn',
      ].every((key) => !!multiDockMap[key])
    ) {
      setOpen(true)
      const landingDock =
        useMapDevicesStore.getState().deviceMap[multiDockMap.landingDockId] // ensure landing dock info is loaded
      const takeoffDock =
        useMapDevicesStore.getState().deviceMap[multiDockMap.takeoffDockId] // ensure takeoff dock info is loaded
      const opts = [
        {
          label: landingDock.deviceName || multiDockMap.landingDockSn,
          value: multiDockMap.landingDockSn,
        },
        {
          label: takeoffDock.deviceName || multiDockMap.takeoffDockSn,
          value: multiDockMap.takeoffDockSn,
        },
      ]
      setOptions(opts)
    } else {
      await postServiceFn('gohome')
    }
  }

  return (
    <>
      <ServiceButton
        disabled={!canGohome}
        icon={IconReturnBase}
        title={t('controlRoom.uav.service.goHome.title')}
        onClick={handleClick}
      />
      {open && (
        <FormModal
          title={t('controlRoom.uav.service.goHome.title')}
          items={[
            {
              label: t('device.uavDock.title'),
              name: 'homeDockSn',
              type: 'radio',
              options: options,
              rules: [{ required: true }],
            },
          ]}
          onClose={() => setOpen(false)}
          onConfirm={async (val) => {
            await postServiceFn('gohome', { homeDockSn: val.homeDockSn })
            setOpen(false)
          }}
        />
      )}
    </>
  )
})

GoHome.displayName = 'GoHome'

export default GoHome
