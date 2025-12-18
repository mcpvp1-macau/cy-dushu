import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import AppViewSuspense from '@/components/AppViewSuspense'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { CollapseProps } from 'antd'
import { lazy } from 'react'
import Scorpion from './Scorpion'
import FC30PD1 from './FC30PD1'
import { uniq } from 'lodash'

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
  | 'Th4Thrower'
  | 'FC30PD1'

const labelMap: { [key in MountType]: string } = {
  PARACHUTE: '降落伞',
  MMC_Gimbal_P3: '喊话器 P3',
  MMC_Gimbal_Z60R: '云台相机 Z60R',
  MMC_Gimbal_Z30Pro: '云台相机 Z30Pro',
  MMC_Gimbal_D4: '抛投器 D4',
  MMC_Gimbal_LP12_1: '喊话器',
  MMC_Gimbal_LP12_2: '探照灯',
  H3DSpeaker: '喊话器 H3D',
  Th4Thrower: '抛投器 Th4',
  FC30PD1: '抛投器',
}

/** 无人机负载 */
const UavPayload: FC<PropsType> = memo(({ productKey: _productKey }) => {
  const mount: string[] = useUavControlRoomStore((s) => s.state.mounts) || []

  const mounts = useMemo(() => {
    return uniq(mount)
      .flatMap((item) =>
        item === 'MMC_Gimbal_LP12' ? ['MMC_Gimbal_LP12_1', 'MMC_Gimbal_LP12_2'] : [item],
      )
      .filter((item): item is MountType => item in labelMap)
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
    Th4Thrower: <Scorpion />,
    FC30PD1: <FC30PD1 />,
  }

  const collapseItems = useMemo<NonNullable<CollapseProps['items']>>(() => {
    return (
      mounts?.map((item) => ({
        key: item,
        label: labelMap[item],
        children: <AppViewSuspense>{MountsChildren[item]}</AppViewSuspense>,
      })) ?? []
    )
  }, [mounts])

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
