import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import situation from './modules/situation'
import sources from './modules/sources'
import actionRecord from './modules/action-record'
import organization from './modules/organization'
import controlRoom from './modules/control-room'
import actionPlan from './modules/action-plan'
import airline from './modules/airline'
import demo from './modules/demo'
import events from './modules/events'
import backtracking from './modules/backtracking'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      situation,
      events,
      sources,
      actionRecord,
      organization,
      controlRoom,
      actionPlan,
      airline,
      backtracking,
      // 测试页面
      ...(import.meta.env.DEV ? [demo] : []),
    ],
  },
])

export default router
