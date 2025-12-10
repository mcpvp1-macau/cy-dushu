import Icon from '@/components/Icon'

import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import Control from '@/pages/right/DeviceDetail/WangLouDetail/components/Control'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { Button } from 'antd'

/**
 * 转台控制
 * @returns
 */
const TurntableControl: React.FC = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const { deviceId, productKey } = deviceDetail || {}
  const isCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.isCameraChangePosition,
  )
  const updateIsCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.updateIsCameraChangePosition,
  )
  const hasControlPower = useWangLouControlRoomStore((s) => s.hasControlPower)

  const _enableSmartTrack = useWangLouControlRoomStore((s) => s.enableSmartTrack)
  const _updateEnableSmartTrack = useWangLouControlRoomStore(
    (s) => s.updateEnableSmartTrack,
  )
  const { t } = useTranslation()
  return (
    <div>
      <section className="mx-3 mr-[9px] my-3 flex gap-8 justify-center">
        <Button
          icon={<Icon id="icon-kuangxuan" />}
          disabled={!hasControlPower}
          onClick={() => {
            updateIsCameraChangePosition({
              deviceId: deviceId!,
              productKey: productKey!,
              enabled: !isCameraChangePosition?.enabled,
            })
          }}
        >
          {t('common.smartTrack')}
        </Button>
        {/* <Button
          icon={<Icon id="icon-mubiaojiance" />}
          onClick={() => {
            // TODO 目标跟踪
            updateEnableSmartTrack(!enableSmartTrack)
          }}
        >
          {t('common.autoSmartTrack')}
        </Button> */}
      </section>
      {deviceDetail && <Control data={deviceDetail!} />}
    </div>
  )
}

export default TurntableControl
