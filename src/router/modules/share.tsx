import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageControlRoomUav = lazy(() => import('@/pages/control-room/uav'))

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
      ],
    },
  ],
} as RouteObject
