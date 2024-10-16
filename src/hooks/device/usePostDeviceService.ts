import { postDeviceService } from '@/service/modules/device'
import { useAppMsg } from '../useAppMsg'
import { uniqueId } from 'lodash'

/** 调用设备服务 */
export const usePostDeviceService = (productKey: string, deviceId: string) => {
  const msgApi = useAppMsg()
  const postService = useMemoizedFn(async (identifier: string, data?: any) => {
    const id = uniqueId()
    msgApi.open({
      type: 'loading',
      key: id,
      content: '正在执行操作...',
      duration: 0,
    })
    try {
      const { message } = await postDeviceService(
        productKey,
        deviceId,
        identifier,
        data ?? {},
      )
      msgApi.open({
        type: 'success',
        key: id,
        content: message,
        duration: 3,
      })
    } catch (e: any) {
      msgApi.open({
        type: 'error',
        key: id,
        content: e.message ?? '操作失败',
        duration: 3,
      })
    }
  })

  return postService
}
