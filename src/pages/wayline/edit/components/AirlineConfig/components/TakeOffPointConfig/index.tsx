import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import { Button, Tooltip } from 'antd'
import { round } from 'lodash'
import HNumber from '../../../HNumber'
import { InfoCircleOutlined, LinkOutlined } from '@ant-design/icons'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { DeviceEnum } from '@/enum/device'
import DeviceIcon from '@/components/device/DeviceIcon'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useAppMsg } from '@/hooks/useAppMsg'
import LiqunTippy from '@/components/ui/LiqunTippy'

type PropsType = unknown

/** 参考起飞点设置 */
const TakeOffPointConfig: FC<PropsType> = () => {
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)
  const { t } = useTranslation()

  const [deviceSelectOpen, setDeviceSelectOpen] = useState(false)

  const allDevices = useMapDevicesStore((s) => s.allDevices)

  const msgApi = useAppMsg()

  const options = useMemo(() => {
    if (!allDevices) {
      return []
    }
    const devceTypes = [DeviceEnum.UAV, DeviceEnum.UAV_AIRPORT] as DeviceEnum[]

    return allDevices
      .filter((e) => devceTypes.includes(e.deviceType as DeviceEnum))
      .map((device) => ({
        label: (
          <div className="flex gap-2">
            <DeviceIcon type={device.deviceType} />
            {device.name}
          </div>
        ),
        value: device.deviceId,
        name: device.name,
      }))
  }, [allDevices])

  return (
    <XCard
      title={
        <div className="flex gap-2">
          {takeOffRefPoint ? (
            <div>
              {t('wayline.takeoffRefPoint.setted.title')}{' '}
              <LiqunTippy content={t('wayline.takeoffRefPoint.setted.tooltip')}>
                <InfoCircleOutlined className="text-fore" />
              </LiqunTippy>
            </div>
          ) : (
            t('wayline.takeoffRefPoint.notSetted.title')
          )}
          <IconButton
            tippyProps={{ content: t('common.refDevLoc') }}
            onClick={() => setDeviceSelectOpen(true)}
          >
            <LinkOutlined />
          </IconButton>
        </div>
      }
      topRight={
        <Button
          type="link"
          icon={<IconTakeoff />}
          size="small"
          onClick={() => setIsDrawHome(true)}
        >
          {takeOffRefPoint ? t('common.reset') : t('common.set')}
        </Button>
      }
    >
      {takeOffRefPoint && (
        <HNumber
          className="mt-3"
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={round(takeOffRefPoint[2], 1)}
          unit="m"
          max={globalConfig.uavHeightLimit}
          onChange={(e) => {
            useAirlineConfigStore.getState().updateAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              takeOffRefPoint: [takeOffRefPoint[0], takeOffRefPoint[1], e],
            })
          }}
        />
      )}
      {deviceSelectOpen && (
        <FormModal
          title={
            <div className="flex gap-1.5">
              <LinkOutlined />
              {t('common.refDevLoc')}
            </div>
          }
          items={[
            {
              label: t('common.device'),
              name: 'deviceId',
              type: 'select',
              options: options,
              otherProps: {
                optionFilterProp: 'name',
              },
            },
          ]}
          onClose={() => setDeviceSelectOpen(false)}
          onConfirm={(values) => {
            const device = allDevices.find(
              (d) => d.deviceId === values.deviceId,
            )
            if (!device) {
              return
            }
            let lng = 0,
              lat = 0,
              alt = 0
            if (device.deviceType === DeviceEnum.UAV_AIRPORT) {
              lng = device.properties?.longitude || 0
              lat = device.properties?.latitude || 0
              alt = device.properties?.height || 0
            } else {
              lng = device.properties?.lng || 0
              lat = device.properties?.lat || 0
              alt = device.properties?.altitude || 0
            }
            if (!lng || !lat) {
              msgApi.error('该设备未设置位置，无法选择为参考起飞点')
              return
            }
            useAirlineConfigStore.getState().updateAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              takeOffRefPoint: [lng, lat, alt],
            })
            setDeviceSelectOpen(false)
          }}
        />
      )}
    </XCard>
  )
}

/** 参考起飞点设置 */
const memorizedCpn = memo(TakeOffPointConfig)
memorizedCpn.displayName = 'TakeOffPointConfig'

export default memorizedCpn
