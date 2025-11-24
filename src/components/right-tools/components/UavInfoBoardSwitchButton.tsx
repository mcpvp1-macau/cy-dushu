import IconBillboard from '@/assets/icons/jsx/IconBillboard'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

const UavInfoBoardSwitchButton: FC<PropsType> = memo(() => {
  const enableUavInfoBoard = useMapDevicesStore((s) => s.enableUavInfoBoard)
  const { t } = useTranslation()

  return (
    <FloatIconButton
      tippyProps={{ content: t('uav.infoBoard.title'), placement: 'left' }}
      active={enableUavInfoBoard}
      onClick={() => {
        useMapDevicesStore
          .getState()
          .updateEnableUavInfoBoard(!enableUavInfoBoard)
        if (!enableUavInfoBoard) {
          useMapDevicesStore.getState().updateHiddenUavInfoBoard(new Set())
        }
      }}
    >
      <IconBillboard />
    </FloatIconButton>
  )
})

UavInfoBoardSwitchButton.displayName = 'UavInfoBoardSwitchButton'

export default UavInfoBoardSwitchButton
