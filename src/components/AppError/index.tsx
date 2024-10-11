import { Button } from 'antd'
import { useRef, type FC } from 'react'
import { type FallbackProps } from 'react-error-boundary'
import dayjs from 'dayjs'

type PropsType = FallbackProps

const AppError: FC<PropsType> = ({ error, resetErrorBoundary }) => {
  // 自动重试
  const resetTime = useRef(dayjs())
  if (dayjs().diff(resetTime.current, 'minutes') >= 1) {
    resetTime.current = dayjs()
    resetErrorBoundary()
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center p-10 text-fore bg-ground-200">
      <h1 className="text-[48px]">:(</h1>
      {/^loading.*? chunk/i.test(error.message) ? (
        <>
          <pre className="text-base mt-2 mb-3">系统已经更新, 请刷新浏览器~</pre>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </>
      ) : (
        <>
          <pre className="text-base mt-2 mb-3">{error.message}</pre>
          <div className="flex flex-col gap-2">
            <Button type="primary" onClick={resetErrorBoundary}>
              重新尝试
            </Button>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default AppError
