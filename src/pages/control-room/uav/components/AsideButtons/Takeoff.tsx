import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import FormModal from '@/components/XForm/Modal'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import { getDeviceDetail } from '@/service/modules/device'
import ServiceButton from './ServiceButton'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

/** 一键起飞 */
const Takeoff: FC<PropsType> = memo(({ postServiceFn }) => {
  const { t } = useTranslation()
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasService = useDeviceDetailStore((s) => s.serviceHave['takeoff'])

  const parentId = useDeviceDetailStore((s) => s.deviceDetail?.parentId)

  const links = useUavControlRoomStore((s) => s.links)
  const currentLink = useMemo(
    () => links?.find((link) => link.active)?.name ?? 'auto',
    [links],
  )

  const postServicehandler = usePostDeviceServiceHandler()

  const canTakeoff = !isLimitedFly && hasService

  const handleClick = async (data) => {
    if (!parentId || currentLink?.toUpperCase?.() === '5G') {
      await postServiceFn('takeoff', data)
    } else {
      const resp = await getDeviceDetail(parentId)
      const productKey = resp.data.deviceModel.productKey
      await postServicehandler(productKey, parentId, 'takeoff', data)
    }
    setFalse()
  }

  const [open, { setTrue, setFalse }] = useBoolean(false)

  return (
    <>
      <ServiceButton
        title={t('controlRoom.uav.service.takeoff.title')}
        icon={IconTakeoff}
        onClick={setTrue}
      />

      {open && (
        <FormModal
          title="一键起飞"
          localInitialValues={{ key: 'uav_takeoff' }}
          items={[
            {
              label: '起飞高度',
              name: 'height',
              type: 'input-number',
              rules: [{ required: true, message: '请输入起飞高度' }],
              otherProps: {
                addonAfter: <div className="mx-1">m</div>,
                min: 1,
                max: globalConfig.uavHeightLimit,
              },
            },
            {
              label: t('device.uav.takeoffForm.goHomeAltitude.title'),
              name: 'gohomeAltitude',
              type: 'input-number',
              otherProps: {
                addonAfter: <div className="mx-1">m</div>,
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
