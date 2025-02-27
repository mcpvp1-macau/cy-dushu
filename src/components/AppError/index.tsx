import { themeConfig } from '@/config/theme-config'
import { postServerLog } from '@/service/modules/logs'
import { Button, ConfigProvider } from 'antd'
import { useRouteError } from 'react-router'

type ErrorBoundaryProps = unknown

const Content = () => {
  const error = useRouteError()

  // 用于生产环境下, 向 4A 发送错误日志
  useEffect(() => {
    if (import.meta.env.PROD && error instanceof Error) {
      postServerLog(
        'error',
        JSON.stringify({
          message: error.message,
          stack: error.stack,
        }),
      )
    }
  }, [error])

  if (error instanceof TypeError) {
    if (
      error.message.startsWith('Failed to fetch dynamically imported module')
    ) {
      return (
        <div className="flex flex-col items-center gap-3 text-white">
          <pre className="text-lg">系统已经更新, 请刷新浏览器~</pre>
          <div>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </div>
      )
    }
  }

  if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center gap-3 text-white">
        <pre className="text-lg">{error.message}</pre>
        {import.meta.env.DEV && (
          <pre className="text-sm text-red-600 my-3 bg-ground-3 p-2 rounded-lg border border-solid border-red-800">
            {error.stack}
          </pre>
        )}
        <div>
          <Button onClick={() => window.location.reload()}>刷新页面</Button>
        </div>
      </div>
    )
  }

  console.error(error)
  return (
    <div className="flex flex-col items-center gap-3 text-white">
      <pre className="text-lg">未知错误</pre>
      <div>
        <Button onClick={() => window.location.reload()}>刷新页面</Button>
      </div>
    </div>
  )
}

const AppErrorBoundary: FC<ErrorBoundaryProps> = memo(() => {
  return (
    <ConfigProvider theme={themeConfig}>
      <div className="w-screen h-screen flex items-center justify-center bg-ground-1">
        <Content />
      </div>
    </ConfigProvider>
  )
})

AppErrorBoundary.displayName = 'AppErrorBoundary'

export default AppErrorBoundary
