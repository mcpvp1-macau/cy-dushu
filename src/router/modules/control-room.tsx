import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageControlRoomUav = lazy(() => import('@/pages/control-room/uav'))
const PageControlRoomWangLou = lazy(() => import('@/pages/control-room/wanglou'))
const PageControlRoomOthers = lazy(() => import('@/pages/control-room/others'))
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
    {
      id: 'control-room/others',
      path: 'others/:deviceId',
      element: <PageControlRoomOthers />,
    },
  ],
} as RouteObject
