import useDeviceState from '@/pages/control-room/wanglou/hooks/useDeviceState'
import {
  WANGLOUTargetName as Name,
  WanglouDeviceTypeMap as TypeMap,
} from '@/pages/control-room/wanglou/components/StatusInfo/config'
import { useTranslation } from 'react-i18next'
import { useMemoizedFn } from 'ahooks'
import useConfig from '@/pages/control-room/wanglou/components/StatusInfo/useConfig'
import IconButton from '@/components/ui/button/IconButton'
import Icon from '@/components/Icon'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { shouldJson } from '@/utils/json'

const WanglouInfo: React.FC = memo(() => {
  const deviceDetail = useBackTrackingStore((s) => s.detail)!
  const currentAttribute = useBackTrackingStore((s) => s.currentAttribute) || {}
  const { _deviceModel, childDevice, properties } = deviceDetail || {}
  const { wanglouDeviceInfo } = useConfig()
  const getChildDevice = useMemoizedFn((value: string) => {
    return childDevice?.find((item: any) => item.productKey === TypeMap[value])
  })

  const state = useMemo(() => {
    const cur = currentAttribute
      ? shouldJson(currentAttribute?.properties || '{}')
      : {}
    return {
      ...(cur[deviceDetail?.deviceId] || {}),
      ...cur,
    }
  }, [currentAttribute])

  const { t } = useTranslation()

  const beidouStatus = getChildDevice(Name.BeiDou)?.status
  const turntableStatus = state.status
  const infraredStatus = getChildDevice(Name.Infrared)?.status
  const visibleLightStatus = getChildDevice(Name.VisibleLight)?.status
  const radarStatus = getChildDevice(Name.Radar)?.status
  const vibratorStatus = getChildDevice(Name.Vibrator)?.status
  const edgeComputeDevice = getChildDevice(Name.EdgeCompute)
  const edgeComputeDeviceStatus = edgeComputeDevice?.status

  const [_beidou, biedoup] = useDeviceState(deviceDetail, state, Name.BeiDou)
  const [_dianchi, dianchip] = useDeviceState(deviceDetail, state, Name.Battery)
  const [_zhuantai, _zhuantaip] = useDeviceState(
    deviceDetail,
    state,
    Name.Turntable,
  )
  const [_kejianguang, _kejianguangp] = useDeviceState(
    deviceDetail,
    state,
    Name.VisibleLight,
  )
  const [_hongwai, _hongwaip] = useDeviceState(deviceDetail, state, Name.Infrared)
  const [_leida, _leidap] = useDeviceState(deviceDetail, state, Name.Radar)
  const [_zhendongyi, _zhendongyip] = useDeviceState(
    deviceDetail,
    state,
    Name.Vibrator,
  )

  const wanglouProps = {
    ...(properties || {}),
    status: state.status,
    beidouStatus,
    turntableStatus,
    infraredStatus,
    visibleLightStatus,
    radarStatus,
    vibratorStatus,
    turntablePose: `${properties?.yaw / 100 || 0}°; ${
      properties?.pitch / 100 || 0
    }°`,
    remainingPower: state.remainingPower,
    edgeComputeDeviceWarningInfo: edgeComputeDevice?.properties?.warningFlag
      ? edgeComputeDevice?.properties?.warningMessage
      : null,
    edgeComputeStatus: edgeComputeDevice?.status,
    edgeComputeDeviceStatus,
    remainingPowerWaringInfo: dianchip?.warningFlag
      ? dianchip?.warningMessage
      : null,
    beidouWaringInfo: biedoup?.warningFlag ? biedoup?.warningMessage : null,
  }

  const getWarn = (propertyName) => {
    const value = wanglouProps[propertyName]
    const warnConfig = wanglouDeviceInfo[Name.WANGLOU].find(
      (item) => item.propertyName === propertyName,
    )?.warnConfig
    const isShowCusWaring = warnConfig?.showCusWaring?.(
      wanglouProps[warnConfig?.warningName || ''],
    )
    const showWarning = isShowCusWaring || warnConfig?.enable?.(value)
    const text =
      warnConfig?.tooltip || wanglouProps[warnConfig?.warningName || '']
    if (showWarning) {
      return (
        <IconButton style={{ marginLeft: 6 }} tippyProps={{ content: text }}>
          <Icon id="icon-tishi" className="text-orange-500" />
        </IconButton>
      )
    }
    return (
      <IconButton
        style={{ marginLeft: 6 }}
        tippyProps={{ content: t('source.status.online') }}
      >
        <Icon id="icon-tishi" className="text-[#15B371]" />
      </IconButton>
    )
  }

  const render = (label, column, style) => {
    return (
      <div
        className={clsx(
          'absolute flex border-[1px] border-[#37414d] rounded-[3px]',
          'w-[74px] h-[24px] justify-center text-[12px] leading-[24px]',
          'shadow',
        )}
        style={{
          top: style.top,
          left: style.left,
        }}
      >
        {label}
        {getWarn(column)}
      </div>
    )
  }
  return (
    <div
      className={clsx(
        "bg-[url('/images/wanglou/wanglou.png')] size-full bg-origin-content bg-no-repeat bg-center bg-contain grid grid-cols-2 gap-x-2",
        'p-[20px] h-[220px] relative',
      )}
    >
      {render('Mesh', 'edgeComputeStatus', {
        top: 30,
        left: `calc(50% - 74px - 74px)`,
      })}
      {render(t('device.wanglou.child.ir'), 'infraredStatus', {
        top: 74,
        left: `calc(50% - 74px - 74px)`,
      })}
      {render(t('device.wanglou.child.battery'), 'remainingPower', {
        top: 160,
        left: `calc(50% - 74px - 74px)`,
      })}
      {render(t('device.wanglou.child.computer'), 'edgeComputeDeviceStatus', {
        top: 30,
        left: `calc(50% + 80px)`,
      })}
      {render(t('device.wanglou.child.visiblelight'), 'visibleLightStatus', {
        top: 65,
        left: `calc(50% + 80px)`,
      })}
      {render(t('device.wanglou.child.radar'), 'radarStatus', {
        top: 96,
        left: `calc(50% + 80px)`,
      })}
      {render(t('device.wanglou.child.vibrator'), 'vibratorStatus', {
        top: 144,
        left: `calc(50% + 80px)`,
      })}
    </div>
  )
})

export default WanglouInfo
