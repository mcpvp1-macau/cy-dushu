import Icon from '@/components/Icon'
import IconButton from '@/components/ui/button/IconButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import clsx from 'clsx'
import {
  WANGLOUTargetName as Name,
  WanglouDeviceTypeMap as TypeMap,
} from './config'
import useDeviceState from '../../hooks/useDeviceState'
import useConfig from './useConfig'

type PropsType = {}

const DeviceStatusInfo: React.FC<PropsType> = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const state = useWangLouControlRoomStore((s) => s.state)
  const { deviceModel, childDevice, properties } = deviceDetail || {}
  const { wanglouDeviceInfo } = useConfig()
  const getChildDevice = useMemoizedFn((value: string) => {
    return childDevice?.find((item: any) => item.productKey === TypeMap[value])
  })

  const beidouStatus = getChildDevice(Name.BeiDou)?.status
  const turntableStatus = state.status
  const infraredStatus = getChildDevice(Name.Infrared)?.status
  const visibleLightStatus = getChildDevice(Name.VisibleLight)?.status
  const radarStatus = getChildDevice(Name.Radar)?.status
  const vibratorStatus = getChildDevice(Name.Vibrator)?.status
  const edgeComputeDevice = getChildDevice(Name.EdgeCompute)
  const edgeComputeDeviceStatus = edgeComputeDevice?.status

  const [beidou, biedoup] = useDeviceState(deviceDetail, state, Name.BeiDou)
  const [dianchi, dianchip] = useDeviceState(deviceDetail, state, Name.Battery)
  const [zhuantai, zhuantaip] = useDeviceState(
    deviceDetail,
    state,
    Name.Turntable,
  )
  const [kejianguang, kejianguangp] = useDeviceState(
    deviceDetail,
    state,
    Name.VisibleLight,
  )
  const [hongwai, hongwaip] = useDeviceState(deviceDetail, state, Name.Infrared)
  const [leida, leidap] = useDeviceState(deviceDetail, state, Name.Radar)
  const [zhendongyi, zhendongyip] = useDeviceState(
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
        <IconButton
          style={{ marginLeft: 6 }}
          toolTipProps={{
            title: text,
          }}
        >
          <Icon id="icon-tishi" className="text-[#F29D49]" />
        </IconButton>
      )
    }
    return (
      <IconButton
        style={{ marginLeft: 6 }}
        toolTipProps={{
          title: '在线',
        }}
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
      {render('红外', 'infraredStatus', {
        top: 74,
        left: `calc(50% - 74px - 74px)`,
      })}
      {render('电池', 'remainingPower', {
        top: 160,
        left: `calc(50% - 74px - 74px)`,
      })}
      {render('边缘计算', 'edgeComputeDeviceStatus', {
        top: 30,
        left: `calc(50% + 80px)`,
      })}
      {render('可见光', 'visibleLightStatus', {
        top: 65,
        left: `calc(50% + 80px)`,
      })}
      {render('雷达', 'radarStatus', { top: 96, left: `calc(50% + 80px)` })}
      {render('震动仪', 'vibratorStatus', {
        top: 144,
        left: `calc(50% + 80px)`,
      })}
    </div>
  )
}

export default DeviceStatusInfo
