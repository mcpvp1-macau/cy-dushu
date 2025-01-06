import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageControlRoomUav = lazy(() => import('@/pages/control-room/uav'))
const PageControlRoomWangLou = lazy(() => import('@/pages/control-room/wanglou'))
export default {
  id: 'control-room',
  path: 'control-room',
  children: [
    {
      id: 'control-room/uav',
      path: 'uav/:deviceId',
      element: <PageControlRoomUav />,
    },
    {
      id: 'control-room/wanglou',
      path: 'wanglou/:deviceId',
      element: <PageControlRoomWangLou />,
    },
  ],
} as RouteObject
