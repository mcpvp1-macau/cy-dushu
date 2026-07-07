// side-effect imports
import './instrument.ts'
import ReactDOM from 'react-dom/client'
import initToken from './global/Initial/init-token.ts'
import initDemoAuth from './global/Initial/init-demo-auth.ts'
import useUserStore from './store/useUser.store.ts'
import { RouterProvider } from 'react-router'
import router from './router'

import { QueryClientProvider } from '@tanstack/react-query'

import ShareVideo from './pages/share-video/index.tsx'

import queryClient from './global/query-client.ts'

import '@/assets/style/index.less'

import 'dayjs/locale/zh-cn'
import '@/global/favicon-change.ts'

import './langs/i18n.ts'

import { createBrowserRouter } from 'react-router-dom'

// 设置 dayjs 语言
dayjs.locale('zh-cn')

const videoRouter = createBrowserRouter([
  {
    path: 'share/video/:productKey/:deviceId/:videoId/:token',
    element: <ShareVideo />,
  },
])

// 入口
;(async () => {
  if (location.pathname.startsWith('/share/video')) {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <QueryClientProvider client={queryClient}>
        {/* <ShareVideo /> */}
        <RouterProvider router={videoRouter} />
      </QueryClientProvider>,
    )
  } else {
    const userStore = useUserStore.getState()
    if (globalConfig.demoMode) {
      // 纯前端演示: 跳过登录鉴权, 使用本地假用户
      initDemoAuth()
    } else {
      const suc = await initToken()
      if (!suc) {
        return
      }
      userStore.fetchUserInfoAndMenus()
      userStore.fetchSystemInfo()
      userStore.initGroupDeviceTree()
      userStore.initVendorBackurl()
    }

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  }
})()
