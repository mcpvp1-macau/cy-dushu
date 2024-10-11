import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageAirline = lazy(() => import('@/pages/airline'))
const PageAirlineEdit = lazy(() => import('@/pages/airline/edit'))

export default {
  id: 'airline',
  path: 'airline',
  children: [
    {
      id: 'list',
      path: '',
      element: <PageAirline />,
    },
    {
      id: 'edit',
      path: 'edit',
      children: [
        {
          path: ':waylineTemplateId',
          element: <PageAirlineEdit />,
        },
        {
          path: '',
          element: <PageAirlineEdit />,
        },
      ],
    },
  ],
} as RouteObject
