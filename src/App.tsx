import { Outlet, useMatches } from 'react-router-dom'
import AppHeader from './components/Header'
import AppNavigator from './components/Navigator'
import { useTitle } from 'ahooks'
import GlobalMap from './map/GlobalMap'
import { message, notification } from 'antd'
import { AppMsgContext, msgMitt } from './hooks/useAppMsg'
import {
  NotificationContext,
  notificationMitt,
} from './hooks/useNotification.ts'
import GlobalState from './components/GlobalState'
import Right from './pages/right'
import AppViewSuspense from './components/AppViewSuspense'
import RightTools from './components/right-tools'
import { themeConfig } from './config/theme-config'
import AppEmpty from './components/AppEmpty.tsx'
import zh from 'antd/es/locale/zh_CN'
import en from 'antd/es/locale/en_US'

import controlRoom from './router/modules/control-room'
import sources from './router/modules/sources'
import schedule from './router/modules/action-plan'
import organization from './router/modules/organization'
import FixedWindowArea from './components/FixedWindowsArea'
import backtracking from './router/modules/backtracking'
import share from './router/modules/share.tsx'
import { XProvider } from '@ant-design/x'
import Update from './components/Update'

const hidenSet = new Set([
  controlRoom.id,
  sources.id,
  schedule.id,
  organization.id,
  backtracking.id,
  share.id,
])

const App = () => {
  useTitle(globalConfig.title ?? '牍术·无人装备智能引擎')

  const [messageApi, contextHolder] = message.useMessage({
    top: 45,
    maxCount: 3,
  })

  const [notificationApi, notificationContextHolder] =
    notification.useNotification({
      placement: 'top',
      duration: 0,
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

  const hideAppHeaderAndNavigator = useMemo(
    () => matcheds.find((e) => e.id === share.id),
    [matcheds],
  )

  const { i18n } = useTranslation()

  return (
    <XProvider
      renderEmpty={() => <AppEmpty />}
      theme={themeConfig}
      locale={i18n.language === 'zh' ? zh : en}
    >
      <Update />
      <div
        className={clsx(
          'w-screen h-screen overflow-hidden',
          'flex flex-col',
          'text-fore',
        )}
      >
        <FixedWindowArea />
        <AppMsgContext.Provider value={messageApi}>
          <NotificationContext.Provider value={notificationApi}>
            {contextHolder}
            {notificationContextHolder}
            <GlobalState />
            {!hideAppHeaderAndNavigator && <AppHeader />}
            <div className="flex-grow overflow-hidden">
              <div className="h-full flex overflow-hidden">
                {!hideAppHeaderAndNavigator && <AppNavigator />}
                <main className="flex-grow bg-ground-1 relative overflow-hidden z-10">
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
          </NotificationContext.Provider>
        </AppMsgContext.Provider>
      </div>
    </XProvider>
  )
}

export default App
