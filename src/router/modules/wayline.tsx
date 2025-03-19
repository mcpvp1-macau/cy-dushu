import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageAirline = lazy(() => import('@/pages/wayline'))
const PageAirlineEdit = lazy(() => import('@/pages/wayline/edit'))
const PageAreaWaylineEdit = lazy(() => import('@/pages/wayline/area-wayline'))
const PageSwarmWaylineEdit = lazy(() => import('@/pages/wayline/swarm-wayline'))
const RebotDogWaylineEdit = lazy(
  () => import('@/pages/wayline/rebot-dog-wayline'),
)

export default {
  id: 'wayline',
  path: 'wayline',
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
    {
      id: 'area-wayline-edit',
      path: 'area-wayline-edit',
      children: [
        {
          path: ':waylineTemplateId',
          element: <PageAreaWaylineEdit />,
        },
        {
          path: '',
          element: <PageAreaWaylineEdit />,
        },
      ],
    },
    {
      id: 'swarm-wayline-edit',
      path: 'swarm-wayline-edit',
      children: [
        {
          path: ':waylineTemplateId',
          element: <PageSwarmWaylineEdit />,
        },
        {
          path: '',
          element: <PageSwarmWaylineEdit />,
        },
      ],
    },
    {
      id: 'rebot-dog-wayline-edit',
      path: 'rebot-dog-wayline-edit',
      children: [
        {
          path: ':waylineTemplateId',
          element: <RebotDogWaylineEdit />,
        },
        {
          path: '',
          element: <RebotDogWaylineEdit />,
        },
      ],
    },
  ],
} as RouteObject
