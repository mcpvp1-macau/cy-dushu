import { postDeviceService } from '@/service/modules/device'
import { useAppMsg } from '../useAppMsg'
import { uniqueId } from 'lodash'

const fmt = (content: string, prefix?: string) => {
  return prefix ? `${prefix}: ${content}` : content
}

/** 调用设备服务 */
export const usePostDeviceService = (productKey: string, deviceId: string) => {
  const { t } = useTranslation()

  const msgApi = useAppMsg()
  const postService = useMemoizedFn(
    async (identifier: string, data?: any, msgPrefix?: string) => {
      const id = uniqueId()
      msgApi.open({
        type: 'loading',
        key: id,
        content: fmt(t('common.requsting'), msgPrefix),
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
          content: fmt(t('api.error.msg'), msgPrefix),
          duration: 3,
        })
        throw e
      }
    },
  )

  return postService
}
