import { DeviceEnum } from '@/enum/device'
import { lazy, LazyExoticComponent } from 'react'

const UavDetail = lazy(() => import('./UavDetail'))
const UavAirportDetail = lazy(() => import('./UavAirportDetail'))
const CameraDetail = lazy(() => import('./CameraDetail'))
const WangLouDetail = lazy(() => import('./WangLouDetail'))
const OthersDetail = lazy(() => import('./OthersDetail'))
const RobotDogDetail = lazy(() => import('./RebotDogDetail'))
const ErEfCarDetail = lazy(() => import('./ErEfCarDetail/ErEfCarDetail'))
const LaserWeaponDetail = lazy(() => import('./LaserWeaponDetail/LaserWeaponDetail'))
const UbDetail = lazy(() => import('./UbDetail'))

/** 设备详情组件路由（需要实现 BaseDeviceDetailProps 类型） */
const route = {
  [DeviceEnum.UAV]: UavDetail,
  [DeviceEnum.UAV_AIRPORT]: UavAirportDetail,
  [DeviceEnum.CAMERA]: CameraDetail,
  [DeviceEnum.WANGLOU]: WangLouDetail,
  [DeviceEnum.ROBOT_DOG]: RobotDogDetail,
  [DeviceEnum.ER_EF_CAR]: ErEfCarDetail,
  [DeviceEnum.LASER_WEAPON]: LaserWeaponDetail,
  [DeviceEnum.UB]: UbDetail,
} as const

/** 设备详情组件基础类型 */
export type BaseDeviceDetailProps = {
  data: API_DEVICE.domain.Device
  headerTools?: ReactNode
  onClose?: () => void
  headerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
}

/**
 * 获取设备详情组件
 * @param deviceType 设备类型
 * @returns 设备详情组件
 */
export const getDeviceDetailComponent = (deviceType: DeviceEnum) => {
  const component = (route[deviceType] || OthersDetail) as LazyExoticComponent<
    FC<BaseDeviceDetailProps>
  >
  return component
}
