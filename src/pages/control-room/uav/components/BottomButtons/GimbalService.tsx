import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { Dropdown, Tooltip } from 'antd'
import gimbalBottom from '@/assets/imgs/control/gimbalBottom.png'
import gimbalMiddle from '@/assets/imgs/control/gimbalMiddle.png'
import gimbalPitchBottom from '@/assets/imgs/control/gimbalPitchBottom.png'
import gimbalYawMiddle from '@/assets/imgs/control/gimbalYawMiddle.png'
import follow from '@/assets/imgs/control/follow.png'
import freedom from '@/assets/imgs/control/freedom.png'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import usePostDeviceService from '../../hooks/usePostDeviceService'

type PropsType = unknown

const GimbalService: FC<PropsType> = memo(() => {
  const gimbalMode = useUavControlRoomStore((s) => s.state.gimbalMode)

  const { t } = useTranslation()

  const postService = usePostDeviceService()

  const handleClick = useMemoizedFn(({ key }) => {
    const data =
      key !== 'setGimbalMode'
        ? {}
        : { mode: gimbalMode === 'free' ? 'follow' : 'free' }
    postService(key, data)
  })

  return (
    <Dropdown
      placement="top"
      menu={{
        onClick: handleClick,
        items: [
          {
            key: 'resetGimbal',
            label: (
              <Tooltip
                title={t('controlRoom.control.gimbalReset.title')}
                placement="right"
              >
                <img src={gimbalMiddle} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalToDown',
            label: (
              <Tooltip
                title={t('controlRoom.control.gimbalToDown.title')}
                placement="right"
              >
                <img src={gimbalBottom} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalYaw',
            label: (
              <Tooltip
                title={t('controlRoom.control.gimbalResetYaw.title')}
                placement="right"
              >
                <img src={gimbalYawMiddle} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalPitchToDown',
            label: (
              <Tooltip
                title={t('controlRoom.control.gimbalPitchDown.title')}
                placement="right"
              >
                <img src={gimbalPitchBottom} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'setGimbalMode',
            label: (
              <Tooltip
                title={
                  gimbalBottom === 'free'
                    ? t('controlRoom.control.gimbalFollowMode.title')
                    : t('controlRoom.control.gimbalFreeMode.title')
                }
                placement="right"
              >
                <img
                  src={gimbalMode === 'free' ? follow : freedom}
                  className="w-6"
                />
              </Tooltip>
            ),
          },
        ],
      }}
    >
      <FloatIconButton className="scale-90">
        <img
          src={gimbalMode === 'free' ? freedom : follow}
          className="w-6 h-6 mx-auto"
        />
      </FloatIconButton>
    </Dropdown>
  )
})

GimbalService.displayName = 'GimbalService'

export default GimbalService
