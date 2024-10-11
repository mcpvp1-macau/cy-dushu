import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageSources = lazy(() => import('@/pages/sources'))

export default {
  id: 'sources',
  path: 'sources',
  element: <PageSources />,
} as RouteObject
