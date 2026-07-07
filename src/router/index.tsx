import { createBrowserRouter, RouteObject } from 'react-router-dom'
import App from '@/App'
import situation from './modules/situation'
import sources from './modules/sources'
import actionRecord from './modules/action-record'
import alarms from './modules/alarms'
import controlRoom from './modules/control-room'
import actionPlan from './modules/action-plan'
import wayline from './modules/wayline'
import demo from './modules/demo'
import events from './modules/events'
import backtracking from './modules/backtracking'
import AppErrorBoundary from '@/components/AppError'
// import Page404 from '@/pages/404'
import share from './modules/share'
import eventResolve from './modules/event-resolve'
import documents from './modules/documents'

export const rootRoute = {
  element: <App />,
  children: [
    situation,
    events,
    eventResolve,
    sources,
    actionRecord,
    alarms,
    controlRoom,
    actionPlan,
    wayline,
    backtracking,
    share,
    documents,
    // 测试页面
    ...(import.meta.env.DEV ? [demo] : []),
    // {
    //   path: '*',
    //   element: <Page404 />,
    // },
  ],
  ErrorBoundary: AppErrorBoundary,
} as RouteObject

const router = createBrowserRouter([rootRoute])

export default router
