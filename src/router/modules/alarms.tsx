import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageAlarms = lazy(() => import('@/pages/alarms'))

export default {
  id: 'alarms',
  path: 'alarms',
  element: <PageAlarms />,
} as RouteObject
