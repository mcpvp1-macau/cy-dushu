import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import { ScrollArea } from '@/components/ui/scroll-area'
import { emtpyArray } from '@/constant/data'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { CollapseProps } from 'antd'
import { lazy, Suspense } from 'react'

const MMC_Gimbal_P3 = lazy(() => import('./MMC_Gimbal_P3'))
const MMC_Gimbal_D4 = lazy(() => import('./MMC_Gimbal_D4'))
const MMC_Gimbal_LP12_1 = lazy(() => import('./MMC_Gimbal_LP12_1'))
const MMC_Gimbal_LP12_2 = lazy(() => import('./MMC_Gimbal_LP12_2'))
const MMC_Gimbal_Z30Pro = lazy(() => import('./MMC_Gimbal_Z30Pro'))
const MMC_Gimbal_Z60R = lazy(() => import('./MMC_Gimbal_Z60R'))
const PARACHUTE = lazy(() => import('./PARACHUTE'))

type PropsType = unknown

type MountType =
  | 'PARACHUTE'
  | 'MMC_Gimbal_P3'
  | 'MMC_Gimbal_Z60R'
  | 'MMC_Gimbal_Z30Pro'
  | 'MMC_Gimbal_LP12_1' // 喊话器
  | 'MMC_Gimbal_LP12_2' // 探照灯
  | 'MMC_Gimbal_D4'

const labelMap: { [key in MountType]: string } = {
  PARACHUTE: '降落伞',
  MMC_Gimbal_P3: '喊话器 P3',
  MMC_Gimbal_Z60R: '云台相机 Z60R',
  MMC_Gimbal_Z30Pro: '云台相机 Z30Pro',
  MMC_Gimbal_D4: '抛投器 D4',
  MMC_Gimbal_LP12_1: '喊话器',
  MMC_Gimbal_LP12_2: '探照灯',
}

/** 无人机负载 */
const UavPayload: FC<PropsType> = memo(() => {
  // TODO mock 挂载
  const mount: string[] = useUavControlRoomStore((s) => s.state.mounts) || [
    'PARACHUTE',
    'MMC_Gimbal_P3',
    'MMC_Gimbal_Z60R',
    'MMC_Gimbal_Z30Pro',
    'MMC_Gimbal_LP12_1',
    'MMC_Gimbal_LP12_2',
    'MMC_Gimbal_D4',
  ]

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
    PARACHUTE: (
      <Suspense fallback={'loading...'}>
        <PARACHUTE />
      </Suspense>
    ),
    MMC_Gimbal_P3: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_P3 />
      </Suspense>
    ),
    MMC_Gimbal_Z60R: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_Z60R />
      </Suspense>
    ),
    MMC_Gimbal_Z30Pro: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_Z30Pro />
      </Suspense>
    ),
    MMC_Gimbal_D4: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_D4 />
      </Suspense>
    ),
    MMC_Gimbal_LP12_1: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_LP12_1 />
      </Suspense>
    ),
    MMC_Gimbal_LP12_2: (
      <Suspense fallback={'loading...'}>
        <MMC_Gimbal_LP12_2 />
      </Suspense>
    ),
  }

  const collapseItems: CollapseProps['items'] =
    mounts?.map((item: MountType) => {
      return {
        key: item,
        label: labelMap[item],
        children: MountsChildren[item],
      }
    }) || emtpyArray

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
