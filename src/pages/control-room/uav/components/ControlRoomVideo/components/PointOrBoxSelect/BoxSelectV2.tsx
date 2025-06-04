import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useAppMsg } from '@/hooks/useAppMsg'
import { autoPhotoGraphCalc } from '@/service/modules/autoPhotograph'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import { ComponentRef, RefObject } from 'react'
import { autoAIPhotoParamsEmitter } from '../../../AsideButtons/IntelligentPhotograph'
import DrawBox from '@/components/DrawBox'

type PropsType = {
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>
}

type Box = [number, number, number, number]

/** 框选 V2 */
const BoxSelectV2: FC<PropsType> = memo(({ deviceLiveVideoRef }) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const state = useUavControlRoomStore((s) => s.state)
  const speed = useUavControlRoomStore((s) => s.flyParams.flySpeed)

  const gimbalPitch = useUavControlRoomStore((s) => s.state.gimbalPitch)

  const larserDistance =
    useUavControlRoomStore((s) => s.state.laserDistance) ?? -1

  // 获取视频截图 base64 数据
  const getVideoBase64Data = () => {
    if (!deviceLiveVideoRef.current) {
      msgApi.error(t('controlRoom.uav.deviceLiveVideoError.msg'))
      return
    }
    const base64 = deviceLiveVideoRef.current.snapshot('image/jpeg')
    if (!base64) {
      msgApi.error(t('controlRoom.uav.deviceLiveVideoError.msg'))
      return
    }
    return base64.split(';base64,')[1]
  }

  // 拍照框选 V1
  const handleAIPhotographV2 = async ([x1, y1, x2, y2]: Box) => {
    if (larserDistance <= 0) {
      msgApi.error(t('controlRoom.uav.larserError.msg'))
      return
    }
    if (isNil(gimbalPitch)) {
      msgApi.error(t('controlRoom.uav.gimbalPitchError.msg'))
      return
    }
    const base64 = getVideoBase64Data()
    if (!base64) {
      return
    }
    // 激光高度
    const larser_height =
      Math.sin(Math.abs(gimbalPitch) * (Math.PI / 180)) * larserDistance

    try {
      const resp = await autoPhotoGraphCalc({
        photo: base64,
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

  const handleDrawEnd = (rect: Box) => {
    handleAIPhotographV2(rect)
  }

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

BoxSelectV2.displayName = 'BoxSelectV2'

export default BoxSelectV2
