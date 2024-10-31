import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageEvents = lazy(() => import('@/pages/events'))

export default {
  id: 'events',
  path: 'events',
  element: <PageEvents />,
} as RouteObject
