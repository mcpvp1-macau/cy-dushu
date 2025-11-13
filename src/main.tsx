import './instrument.ts'
import ReactDOM from 'react-dom/client'
import initToken from './global/Initial/init-token.ts'
import useUserStore from './store/useUser.store.ts'
import { RouterProvider } from 'react-router'
import router from './router'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import ShareVideo from './pages/share-video/index.tsx'

import queryClient from './global/query-client.ts'

import '@/assets/style/index.less'

import 'dayjs/locale/zh-cn'
import '@/global/favicon-change.ts'

import './langs/i18n.ts'

import { queryTerrain } from './utils/map/queryTerrainElevation.js'
import { createBrowserRouter } from 'react-router-dom'

window.queryTerrain = queryTerrain

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
        <ReactQueryDevtools initialIsOpen buttonPosition="bottom-left" />
        {/* <ShareVideo /> */}
        <RouterProvider router={videoRouter} />
      </QueryClientProvider>,
    )
  } else {
    const suc = await initToken()
    if (!suc) {
      return
    }
    const userStore = useUserStore.getState()
    userStore.fetchUserInfoAndMenus()
    userStore.fetchSystemInfo()
    userStore.initGroupDeviceTree()
    userStore.initVendorBackurl()

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen buttonPosition="top-left" />
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  }
})()
