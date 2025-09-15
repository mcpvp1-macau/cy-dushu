import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import AppViewSuspense from '@/components/AppViewSuspense'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { CollapseProps } from 'antd'
import { lazy } from 'react'
import Scorpion from './Scorpion'

const MMC_Gimbal_P3 = lazy(() => import('./MMC_Gimbal_P3'))
const MMC_Gimbal_D4 = lazy(() => import('./MMC_Gimbal_D4'))
const MMC_Gimbal_LP12_1 = lazy(() => import('./MMC_Gimbal_LP12_1'))
const MMC_Gimbal_LP12_2 = lazy(() => import('./MMC_Gimbal_LP12_2'))
const MMC_Gimbal_Z30Pro = lazy(() => import('./MMC_Gimbal_Z30Pro'))
const MMC_Gimbal_Z60R = lazy(() => import('./MMC_Gimbal_Z60R'))
const PARACHUTE = lazy(() => import('./PARACHUTE'))
const MMC_Gimbal_H3D = lazy(() => import('./MMC_Gimbal_H3D'))

type PropsType = {
  productKey: string
}

type MountType =
  | 'PARACHUTE'
  | 'MMC_Gimbal_P3'
  | 'MMC_Gimbal_Z60R'
  | 'MMC_Gimbal_Z30Pro'
  | 'MMC_Gimbal_LP12_1' // 喊话器
  | 'MMC_Gimbal_LP12_2' // 探照灯
  | 'MMC_Gimbal_D4'
  | 'H3DSpeaker'

const labelMap: { [key in MountType]: string } = {
  PARACHUTE: '降落伞',
  MMC_Gimbal_P3: '喊话器 P3',
  MMC_Gimbal_Z60R: '云台相机 Z60R',
  MMC_Gimbal_Z30Pro: '云台相机 Z30Pro',
  MMC_Gimbal_D4: '抛投器 D4',
  MMC_Gimbal_LP12_1: '喊话器',
  MMC_Gimbal_LP12_2: '探照灯',
  H3DSpeaker: '喊话器 H3D',
}

/** 无人机负载 */
const UavPayload: FC<PropsType> = memo(({ productKey }) => {
  // TODO mock 挂载
  const mount: string[] = useUavControlRoomStore((s) => s.state.mounts) || ['H3DSpeaker']
  // || [
  //   'PARACHUTE',
  //   'MMC_Gimbal_P3',
  //   'MMC_Gimbal_Z60R',
  //   'MMC_Gimbal_Z30Pro',
  //   'MMC_Gimbal_LP12_1',
  //   'MMC_Gimbal_LP12_2',
  //   'MMC_Gimbal_D4',
  // ]


  console.log('====',mount)

  const mounts = useMemo(() => {
    const arr: MountType[] = []
    mount.forEach((element: string) => {
      if (element === 'MMC_Gimbal_LP12') {
        arr.push('MMC_Gimbal_LP12_1')
        arr.push('MMC_Gimbal_LP12_2')
      } else {
        arr.push(element as MountType)
      }
    })
    return arr
  }, [mount])

  const MountsChildren: {
    [key in MountType]: React.ReactNode
  } = {
    PARACHUTE: <PARACHUTE />,
    MMC_Gimbal_P3: <MMC_Gimbal_P3 />,
    MMC_Gimbal_Z60R: <MMC_Gimbal_Z60R />,
    MMC_Gimbal_Z30Pro: <MMC_Gimbal_Z30Pro />,
    MMC_Gimbal_D4: <MMC_Gimbal_D4 />,
    MMC_Gimbal_LP12_1: <MMC_Gimbal_LP12_1 />,
    MMC_Gimbal_LP12_2: <MMC_Gimbal_LP12_2 />,
    H3DSpeaker: <MMC_Gimbal_H3D />,
  }

  const hasThrowAt = useDeviceDetailStore((s) => s.serviceHave['throwAt'])
  const collapseItems = useMemo(() => {
    const res: CollapseProps['items'] = []
    mounts?.forEach((item: MountType) => {
      res.push({
        key: item,
        label: labelMap[item],
        children: <AppViewSuspense>{MountsChildren[item]}</AppViewSuspense>,
      })
    })

    if (hasThrowAt) {
      res.push({
        key: 'throwAt',
        label: '抛投器',
        children: <AppViewSuspense>{<Scorpion />}</AppViewSuspense>,
      })
    }
    return res
  }, [mounts, hasThrowAt])

  return (
    <ScrollArea className="size-full">
      {collapseItems.length ? (
        <AppCollapse items={collapseItems} className="border-0" />
      ) : (
        <AppEmpty />
      )}
    </ScrollArea>
  )
})

UavPayload.displayName = 'UavPayload'

export default UavPayload
