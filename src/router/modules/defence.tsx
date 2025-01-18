import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageSources = lazy(() => import('@/pages/defence'))

export default {
  id: 'defence',
  path: 'defence',
  element: <PageSources />,
} as RouteObject
