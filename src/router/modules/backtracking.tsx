import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageBackTrackingDevice = lazy(() => import('@/pages/backtracking/device'))
const PageBackTrackingAction = lazy(() => import('@/pages/backtracking/action'))

export default {
  id: 'backtracking',
  path: 'backtracking',
  children: [
    {
      path: 'device/:deviceId',
      element: <PageBackTrackingDevice />,
    },
    {
      path: 'action/:actionId/:startTime/:endTime',
      element: <PageBackTrackingAction />,
    },
  ],
} as RouteObject
