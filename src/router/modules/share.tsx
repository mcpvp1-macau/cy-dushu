import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageControlRoomUav = lazy(() => import('@/pages/control-room/uav'))
const PageControlRoomLaserWeapon = lazy(
  () => import('@/pages/control-room/laser-weapon/LaserWeaponControlRoom'),
)

export default {
  id: 'share',
  path: 'share',
  children: [
    {
      path: 'control-room',
      children: [
        {
          id: 'share/control-room/uav',
          path: 'uav/:deviceId',
          element: <PageControlRoomUav />,
        },
        {
          id: 'share/control-room/laser-weapon',
          path: 'laser-weapon/:deviceId',
          element: <PageControlRoomLaserWeapon />,
        },
      ],
    },
  ],
} as RouteObject
