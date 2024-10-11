import { Outlet } from 'react-router'
import ScheduleList from './components/ScheduleList'
import AppViewSuspense from '@/components/AppViewSuspense'

type PropsType = unknown

const PageSchedule: FC<PropsType> = memo(() => {
  return (
    <div className="page-full bg-ground-140">
      <div className="h-full flex">
        <ScheduleList />
        <AppViewSuspense>
          <Outlet />
        </AppViewSuspense>
      </div>
    </div>
  )
})

PageSchedule.displayName = 'PageSchedule'

export default PageSchedule
