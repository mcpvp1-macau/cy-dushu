import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageOrganization = lazy(() => import('@/pages/organization'))

export default {
  id: 'organization',
  path: 'organization',
  element: <PageOrganization />,
} as RouteObject
