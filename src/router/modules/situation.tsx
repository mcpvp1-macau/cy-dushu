import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageSituation = lazy(() => import('@/pages/situation'))
const PageSituationAction = lazy(() => import('@/pages/situation/action'))
const PageSituationSource = lazy(() => import('@/pages/situation/source'))
const PageSituationActionDetail = lazy(
  () => import('@/pages/situation/action/detail'),
)
const PageSituationActionDetailSub = lazy(
  () => import('@/pages/situation/action/detail/action'),
)

export default {
  id: 'situation',
  path: '/',
  element: <PageSituation />,
  children: [
    { path: 'action', element: <PageSituationAction /> },
    { path: '', element: <PageSituationAction /> },
    {
      path: 'action/:actionId',
      element: <PageSituationActionDetail />,
      children: [
        {
          path: '',
          element: <PageSituationActionDetailSub />,
        },
        {
          path: 'source/:sourceType',
          element: <PageSituationSource />,
        },
      ],
    },
    {
      path: 'source/:sourceType',
      element: <PageSituationSource />,
    },
  ],
} as RouteObject
