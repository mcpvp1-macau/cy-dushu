import DrawBox from '@/components/DrawBox'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { ComponentRef, RefObject } from 'react'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useAppMsg } from '@/hooks/useAppMsg'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { isNil } from 'lodash'
import { autoPhotoGraphCalc } from '@/service/modules/autoPhotograph'
import { autoAIPhotoParamsEmitter } from '../AsideButtons/IntelligentPhotograph'

type PropsType = {
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>
}

/** 指点变焦 / 框选 */
const PositionZoom: FC<PropsType> = memo(({ deviceLiveVideoRef }) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const postService = usePostDeviceService()

  const posizionZoomOpen = useUavControlRoomStore((s) => s.openPointZoom)
  const state = useUavControlRoomStore((s) => s.state)
  const speed = useUavControlRoomStore((s) => s.flyParams.flySpeed)

  const gimbalPitch = useUavControlRoomStore((s) => s.state.gimbalPitch)

  const larserDistance =
    useUavControlRoomStore((s) => s.state.laserDistance) ?? -1

  const handleDrawEnd = async ([x1, y1, x2, y2]: [
    number,
    number,
    number,
    number,
  ]) => {
    // 指点变焦 ------------------------------------------------------------
    if (posizionZoomOpen === 1) {
      postService('tapZoomAtTarget', { x1, y1, x2, y2 })
      return
    }

    // 框选（v1）
    // if (posizionZoomOpen === 2) {
    //   postService('gimbalToPoint', { x1, y1, x2, y2 })
    //   return
    // }

    // 框选（v1）走不到这下面 ~~~

    // 框选 ----------------------------------------------------------------
    if (larserDistance <= 0) {
      msgApi.error(t('controlRoom.uav.larserError.msg'))
      return
    }
    if (isNil(gimbalPitch)) {
      msgApi.error(t('controlRoom.uav.gimbalPitchError.msg'))
      return
    }
    if (!deviceLiveVideoRef.current) {
      msgApi.error(t('controlRoom.uav.deviceLiveVideoError.msg'))
      return
    }
    const base64 = deviceLiveVideoRef.current.snapshot('image/jpeg')
    if (!base64) {
      msgApi.error(t('controlRoom.uav.deviceLiveVideoError.msg'))
      return
    }
    // 激光高度
    const larser_height =
      Math.sin(Math.abs(gimbalPitch) * (Math.PI / 180)) * larserDistance

    try {
      const resp = await autoPhotoGraphCalc({
        photo: base64.split(';base64,')[1],
        pictureBox: { x1, y1, x2, y2 },
        uav_parameters: state,
      })
      if (resp.status === 200 && resp.data.code === 200) {
        msgApi.info(t('controlRoom.uav.autoPhotographSuccess.msg'))
        autoAIPhotoParamsEmitter.emit('autoAIPhotoParams', {
          ...resp.data.data,
          larser_height,
          speed,
        })
      } else {
        throw new Error(resp.data.message)
      }
    } catch (e: any) {
      const msg = (e.response?.data?.message || e) as string | undefined
      msgApi.error(
        t('controlRoom.uav.autoPhotographError.msg') + (msg ? `: ${msg}` : ''),
      )

      return
    }
  }

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

PositionZoom.displayName = 'PositionZoom'

export default PositionZoom
