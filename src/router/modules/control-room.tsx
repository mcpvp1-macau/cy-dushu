import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageControlRoomUav = lazy(() => import('@/pages/control-room/uav'))

export default {
  id: 'control-room',
  path: 'control-room',
  children: [
    {
      id: 'control-room/uav',
      path: 'uav/:deviceId',
      element: <PageControlRoomUav />,
    },
  ],
} as RouteObject
