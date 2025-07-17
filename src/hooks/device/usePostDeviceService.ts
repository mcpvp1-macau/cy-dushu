import { postDeviceService } from '@/service/modules/device'
import { useAppMsg } from '../useAppMsg'
import { uniqueId } from 'lodash'
import { isLiqunCommonError } from '@/service/servers/liqunAxios'

const fmt = (content: string, prefix?: string) => {
  return prefix ? `${prefix}: ${content}` : content
}

/** 调用设备服务 */
export const usePostDeviceService = (productKey: string, deviceId: string) => {
  const postService = usePostDeviceServiceHandler()
  return (
    identifier: string,
    data?: any,
    msgPrefix?: string,
    showMsg?: boolean,
  ) => postService(productKey, deviceId, identifier, data, msgPrefix, showMsg)
}

/** 调用设备服务 (可以后带 productKey 和 deviceId) */
export const usePostDeviceServiceHandler = () => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  const postService = useMemoizedFn(
    async (
      productKey: string,
      deviceId: string,
      identifier: string,
      data?: any,
      msgPrefix?: string,
      showMsg?: boolean,
    ) => {
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
        if (message && showMsg !== false) {
          msgApi.open({
            type: 'success',
            key: id,
            content: fmt(message, msgPrefix),
            duration: 3,
          })
        } else if (showMsg === false) {
          msgApi.destroy(id)
        }
      } catch (e: any) {
        let content = t('api.error.msg')
        if (isLiqunCommonError(e) && e.message) {
          content = t('api.error.msg') + ': ' + e.message
        }
        msgApi.open({
          type: 'error',
          key: id,
          content: fmt(content, msgPrefix),
          duration: 3,
        })
        throw e
      }
    },
  )

  return postService
}
