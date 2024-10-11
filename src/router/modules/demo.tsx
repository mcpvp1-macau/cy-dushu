import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageDemo = lazy(() => import('@/pages/demo'))

export default {
  id: 'demo',
  path: 'demo',
  element: <PageDemo />,
} as RouteObject
