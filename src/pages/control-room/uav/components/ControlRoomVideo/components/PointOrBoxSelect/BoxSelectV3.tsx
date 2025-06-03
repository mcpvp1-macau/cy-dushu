import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import { ComponentRef, RefObject } from 'react'
import DrawBox from '@/components/DrawBox'
import { autoAIPhotoParamsEmitter } from '../../../AsideButtons/IntelligentPhotograph'
import {
  autoPhotoGraphCalc,
  autoPhotoGraphCalcV2,
} from '@/service/modules/autoPhotograph'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'

type PropsType = {
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>
}

type Box = [number, number, number, number]

/** 框选 V3 */
const BoxSelectV3: FC<PropsType> = memo(({ deviceLiveVideoRef }) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const postService = usePostDeviceService()

  const state = useUavControlRoomStore((s) => s.state)

  const larserDistance =
    useUavControlRoomStore((s) => s.state.laserDistance) ?? -1

  const speed = useUavControlRoomStore((s) => s.flyParams.flySpeed)
  const gimbalPitch = useUavControlRoomStore((s) => s.state.gimbalPitch)

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

  const first_info = useRef<{
    image: string
    uav_parameters: Record<string, any>
    box: { x1: number; y1: number; x2: number; y2: number }
  } | null>(null)

  const handleDrawEnd = (rect: Box) => {
    const base64 = getVideoBase64Data()
    if (isNil(base64)) return

    first_info.current = {
      image: base64,
      uav_parameters: state,
      box: {
        x1: rect[0],
        y1: rect[1],
        x2: rect[2],
        y2: rect[3],
      },
    }
    postService(
      'preAutoPhoto',
      {
        x: (rect[0] + rect[2]) / 2,
        y: (rect[1] + rect[3]) / 2,
      },
      '智能拍照框选预调节',
    )
  }

  const resolvePrePhotoEvent = useMemoizedFn(async ({ needTakePhoto }) => {
    if (first_info.current === null) {
      return
    }

    if (needTakePhoto) {
      const base64 = getVideoBase64Data()
      if (isNil(base64)) return

      const second_info = {
        image: base64,
        uav_parameters: state,
        box: null, // 右侧拍照时不需要 box
      }
      const firstIsLeft =
        (first_info.current.box.x1 + first_info.current.box.x2) / 2 < 0.5
      const left = firstIsLeft ? first_info.current : second_info
      const right = firstIsLeft ? second_info : first_info.current
      try {
        const resp = await autoPhotoGraphCalcV2({
          left_image: left.image,
          left_uav_parameters: left.uav_parameters,
          left_box: left.box,
          right_image: right.image,
          right_uav_parameters: right.uav_parameters,
          right_box: right.box,
        })
        if (resp.status === 200 && resp.data.code === 200) {
          msgApi.info(t('controlRoom.uav.autoPhotographSuccess.msg'))
          autoAIPhotoParamsEmitter.emit('autoAIPhotoParams', {
            ...resp.data.data,
            speed,
          })
        } else {
          throw new Error(resp.data.message)
        }
      } catch (e: any) {
        const msg = (e.response?.data?.message || e) as string | undefined
        msgApi.error(
          t('controlRoom.uav.autoPhotographError.msg') +
            (msg ? `: ${msg}` : ''),
        )
      }
    } else {
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
          photo: first_info.current.image,
          pictureBox: first_info.current.box,
          uav_parameters: first_info.current.uav_parameters,
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
          t('controlRoom.uav.autoPhotographError.msg') +
            (msg ? `: ${msg}` : ''),
        )
        return
      }
    }
  })

  useEffect(() => {
    autoAIPhotoParamsEmitter.on('takingRightPhoto', resolvePrePhotoEvent)

    return () => {
      autoAIPhotoParamsEmitter.off('takingRightPhoto', resolvePrePhotoEvent)
    }
  }, [])

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

BoxSelectV3.displayName = 'BoxSelectV3'

export default BoxSelectV3
