import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageBackTrackingDevice = lazy(() => import('@/pages/backtracking/device'))

export default {
  id: 'backtracking',
  path: 'backtracking',
  children: [
    {
      path: 'device/:deviceId',
      element: <PageBackTrackingDevice />,
    },
  ],
} as RouteObject
