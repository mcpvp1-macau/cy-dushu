import {
  isLiqunCommonError,
  isLiqunDbApiError,
} from '@/service/servers/liqunAxios'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        // 如果是 后端服务 返回的错误 或者 DBAPI 返回的错误, 不重试
        if (isLiqunCommonError(error) || isLiqunDbApiError(error)) {
          return false
        }
        // 最多重试 3 次
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => {
        return Math.min(2000 + 1000 * 2 ** attemptIndex, 10_000)
      },
    },
  },
})

export default queryClient
