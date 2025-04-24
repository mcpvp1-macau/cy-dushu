import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageEventResolve = lazy(() => import('@/pages/event-resolve'))

export default {
  id: 'event-resolve',
  path: 'event-resolve/:eventId',
  element: <PageEventResolve />,
} as RouteObject
