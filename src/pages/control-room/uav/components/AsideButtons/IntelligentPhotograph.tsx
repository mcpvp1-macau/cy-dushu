import IconSmartTakingPhoto from '@/assets/icons/jsx/uav/IconSmartTakingPhoto'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Button } from 'antd'

interface IntelligentPhotographyBtn {
  key: number
  label: string
  btnLabel: string
  btnAction: string
}

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

/** 智能拍照 */
const IntelligentPhotography: FC<PropsType> = memo(({ postServiceFn }) => {
  const { t, i18n } = useTranslation()

  const autoPhotoStatusMap = useMemo(
    () =>
      ({
        0: {
          key: 0,
          label: '停止',
          btnLabel: '',
          btnAction: 'intelligentPhotography',
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

  const start = async (identify: string) => {
    await postServiceFn(identify)
    updateOpenPointZoom(0)
  }

  const handleIntelligentPhotography = async () => {
    start(autoPhotoStatusMap[autoPhotoStatus ?? 0]?.btnAction)
  }

  return (
    <Button
      className="grow h-[26px] px-0"
      disabled={!canSmartTakingPhoto}
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
