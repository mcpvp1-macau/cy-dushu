import ReactDOM from 'react-dom/client'
import initToken from './global/Initial/init-token.ts'
import useUserStore from './store/useUser.store.ts'
import { RouterProvider } from 'react-router'
import router from './router'
import { ConfigProvider } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { themeConfig } from './config/theme-config'
import queryClient from './global/query-client.ts'
import AppEmpty from './components/AppEmpty.tsx'
import '@/assets/style/index.less'
import zh from 'antd/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import '@/global/favicon-change.ts'

// 设置 dayjs 语言
dayjs.locale('zh-cn')

// 入口
;(async () => {
  const suc = await initToken()
  if (!suc) {
    return
  }
  useUserStore.getState().fetchUserInfoAndMenus()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ConfigProvider
      renderEmpty={() => <AppEmpty />}
      theme={themeConfig}
      locale={zh}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen buttonPosition="bottom-left" />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>,
  )
})()
