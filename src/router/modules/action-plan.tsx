import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageSchedule = lazy(() => import('@/pages/action-plan'))
const PageScheduleTable = lazy(
  () => import('@/pages/action-plan/components/ScheduleTable'),
)

export default {
  id: 'schedule',
  path: 'schedule',
  element: <PageSchedule />,
  children: [
    {
      path: '',
      element: <PageScheduleTable />,
    },
    {
      path: ':actionPlanId',
      element: <PageScheduleTable />,
    },
  ],
} as RouteObject
