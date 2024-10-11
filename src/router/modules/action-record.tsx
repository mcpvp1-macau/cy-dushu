import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageActionRecord = lazy(() => import('@/pages/action-record'))

export default {
  id: 'action-record',
  path: 'action-record',
  element: <PageActionRecord />,
} as RouteObject
