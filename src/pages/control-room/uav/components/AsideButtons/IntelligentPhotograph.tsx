import IconSmartTakingPhoto from '@/assets/icons/jsx/uav/IconSmartTakingPhoto'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useUserStore from '@/store/useUser.store'
import { Button } from 'antd'
import mitt from 'mitt'

interface IntelligentPhotographyBtn {
  key: number
  label: string
  btnLabel: string
  btnAction: string
}

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

export type AutoAIPhotoParams = {
  mid_point: Record<string, any>
  point1: Record<string, any>
  point2: Record<string, any>
  speed: number
  larser_height?: number
} | null

type TakingRightPhotoParams = {
  needTakePhoto: boolean
}

export const autoAIPhotoParamsEmitter = mitt<{
  autoAIPhotoParams: AutoAIPhotoParams
  takingRightPhoto: TakingRightPhotoParams
}>()

/** 智能拍照 */
const IntelligentPhotography: FC<PropsType> = memo(({ postServiceFn }) => {
  const { t, i18n } = useTranslation()
  const msgApi = useAppMsg()

  const autoPhotoStatusMap = useMemo(
    () =>
      ({
        0: {
          key: 0,
          label: '停止',
          btnLabel: '',
          btnAction: 'startIntelligentPhotography',
        },
        1: {
          key: 1,
          label: '运行',
          btnLabel: t('common.pause'),
          btnAction: 'pauseIntelligentPhotography',
        },
        2: {
          key: 2,
          label: '暂停',
          btnLabel: t('common.recover'),
          btnAction: 'resumeIntelligentPhotography',
        },
      } as Record<string, IntelligentPhotographyBtn>),
    [t],
  )

  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const autoPhotoStatus = useUavControlRoomStore((s) => s.state.autoPhotoStatus)

  const updateOpenPointZoom = useUavControlRoomStore(
    (s) => s.updateOpenPointZoom,
  )

  const canSmartTakingPhoto =
    hasControlPower && serviceHave['intelligentPhotography']

  const [autoAIPhotoParams, setAutoAIPhotoParams] =
    useState<AutoAIPhotoParams | null>(null)

  useEffect(() => {
    autoAIPhotoParamsEmitter.on('autoAIPhotoParams', (params) => {
      setAutoAIPhotoParams(params)
    })
    return () => {
      autoAIPhotoParamsEmitter.off('autoAIPhotoParams')
    }
  }, [])

  const handleIntelligentPhotography = async () => {
    // start(autoPhotoStatusMap[autoPhotoStatus ?? 0]?.btnAction)
    if (!autoAIPhotoParams) {
      msgApi.error(t('common.parameterError'))
      return
    }
    postServiceFn('startIntelligentPhotography', {
      ...autoAIPhotoParams,
      username: useUserStore.getState().user?.username,
    })
    updateOpenPointZoom(0)
    setAutoAIPhotoParams(null)
  }

  return (
    <Button
      className="grow h-[26px] px-0"
      disabled={!canSmartTakingPhoto || !autoAIPhotoParams}
      icon={<IconSmartTakingPhoto />}
      onClick={handleIntelligentPhotography}
    >
      {t('controlRoom.uav.service.aiPhoto.title')}
      {autoPhotoStatus &&
        `${i18n.language === 'en' ? ' ' : ''}${
          autoPhotoStatusMap[autoPhotoStatus]?.btnLabel
        }`}
    </Button>
  )
})

IntelligentPhotography.displayName = 'IntelligentPhotography'

export default IntelligentPhotography
