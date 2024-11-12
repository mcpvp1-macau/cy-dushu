import { postDeviceService } from '@/service/modules/device'
import { useAppMsg } from '../useAppMsg'
import { uniqueId } from 'lodash'

const fmt = (content: string, prefix?: string) => {
  return prefix ? `${prefix}: ${content}` : content
}

/** 调用设备服务 */
export const usePostDeviceService = (productKey: string, deviceId: string) => {
  const msgApi = useAppMsg()
  const postService = useMemoizedFn(
    async (identifier: string, data?: any, msgPrefix?: string) => {
      const id = uniqueId()
      msgApi.open({
        type: 'loading',
        key: id,
        content: fmt('正在执行操作...', msgPrefix),
        duration: 0,
      })
      try {
        const { message } = await postDeviceService(
          productKey,
          deviceId,
          identifier,
          data ?? {},
        )
        if (message) {
          msgApi.open({
            type: 'success',
            key: id,
            content: fmt(message, msgPrefix),
            duration: 3,
          })
        }
      } catch (e: any) {
        msgApi.open({
          type: 'error',
          key: id,
          content: fmt('操作失败', msgPrefix),
          duration: 3,
        })
      }
    },
  )

  return postService
}
