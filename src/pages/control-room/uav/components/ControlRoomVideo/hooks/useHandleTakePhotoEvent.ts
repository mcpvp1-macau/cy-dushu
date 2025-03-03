import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { uploadPic } from '@/service/modules/device'
import useUserStore from '@/store/useUser.store'
import mitt from 'mitt'
import { ComponentRef, RefObject } from 'react'

export const takePhotoEventEmitter = mitt<{
  takePhotoEvent: {
    username: string
    fileId: any
  }
}>()

/** 处理截图事件 */
const useHandleTakePhotoEvent = (
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>,
) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const username = useUserStore((s) => s.user?.username)
  const handle = useMemoizedFn(
    async (data: { username: string; fileId: string }) => {
      if (username !== data.username) {
        return
      }
      const base64 = await deviceLiveVideoRef.current?.snapshot('image/jpeg')
      if (!base64) {
        msgApi.error(t('controlRoom.uav.deviceLiveVideoError.msg'))
        return
      }
      await uploadPic(productKey, deviceId, {
        imgData: base64.split(';base64,')[1],
        fileId: data.fileId,
      })
      msgApi.success(t('controlRoom.uav.snapshotUploadSuccess.msg'))
    },
  )

  useEffect(() => {
    takePhotoEventEmitter.on('takePhotoEvent', handle)
    return () => {
      takePhotoEventEmitter.off('takePhotoEvent', handle)
    }
  }, [handle])
}

export default useHandleTakePhotoEvent
