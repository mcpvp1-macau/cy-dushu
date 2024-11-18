import { Outlet, useMatches } from 'react-router-dom'
import AppHeader from './components/Header'
import AppNavigator from './components/Navigator'
import { useTitle } from 'ahooks'
import GlobalMap from './map/GlobalMap'
import { message } from 'antd'
import { AppMsgContext, msgMitt } from './hooks/useAppMsg'
import GlobalState from './components/GlobalState'
import Right from './pages/right'
import AppViewSuspense from './components/AppViewSuspense'
import RightTools from './components/right-tools'

import controlRoom from './router/modules/control-room'
import sources from './router/modules/sources'
import schedule from './router/modules/action-plan'
import organization from './router/modules/organization'
import FixedWindowArea from './components/FixedWindowsArea'

const hidenSet = new Set([
  controlRoom.id,
  sources.id,
  schedule.id,
  organization.id,
])

const App = () => {
  useTitle(globalConfig.title ?? '牍术·无人装备智能引擎')

  const [messageApi, contextHolder] = message.useMessage({
    top: 45,
    maxCount: 3,
  })

  useEffect(() => {
    msgMitt.on('open', (payload) => {
      messageApi.open(payload)
    })
    return () => {
      msgMitt.off('open')
    }
  }, [messageApi])

  const matcheds = useMatches()
  const hide = useMemo(
    () => !matcheds.find((e) => hidenSet.has(e.id)),
    [matcheds],
  )

  return (
    <div
      className={clsx(
        'w-screen h-screen overflow-hidden',
        'flex flex-col',
        'text-fore',
      )}
    >
      <FixedWindowArea />
      <AppMsgContext.Provider value={messageApi}>
        {contextHolder}
        <GlobalState />
        <AppHeader />
        <div className="flex-grow overflow-hidden">
          <div className="h-full flex overflow-hidden">
            <AppNavigator />
            <main className="flex-grow bg-ground-100 relative overflow-hidden z-10">
              <div className="absolute h-full z-20 overflow-hidden">
                <AppViewSuspense>
                  <Outlet />
                </AppViewSuspense>
              </div>
              {hide && (
                <>
                  <GlobalMap />
                  <RightTools />
                  <Right />
                </>
              )}
            </main>
          </div>
        </div>
      </AppMsgContext.Provider>
    </div>
  )
}

export default App
