import ReactDOM from 'react-dom/client'
import initToken from './global/Initial/init-token.ts'
import useUserStore from './store/useUser.store.ts'
import { RouterProvider } from 'react-router'
import router from './router'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import queryClient from './global/query-client.ts'

import '@/assets/style/index.less'

import 'dayjs/locale/zh-cn'
import '@/global/favicon-change.ts'

import './langs/i18n.ts'

import { queryTerrain } from './utils/map/queryTerrainElevation.js'

window.queryTerrain = queryTerrain

// 设置 dayjs 语言
dayjs.locale('zh-cn')

// 入口
;(async () => {
  const suc = await initToken()
  if (!suc) {
    return
  }
  useUserStore.getState().fetchUserInfoAndMenus()
  useUserStore.getState().fetchSystemInfo()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen buttonPosition="bottom-left" />
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
})()
