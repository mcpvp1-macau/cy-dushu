import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

const UavInfoBoardSwitchButton: FC<PropsType> = memo(() => {
  const enableUavInfoBoard = useMapDevicesStore((s) => s.enableUavInfoBoard)

  return (
    <FloatIconButton
      active={enableUavInfoBoard}
      onClick={() =>
        useMapDevicesStore
          .getState()
          .updateEnableUavInfoBoard(!enableUavInfoBoard)
      }
    >
      <DeviceIconUAV2 />
    </FloatIconButton>
  )
})

UavInfoBoardSwitchButton.displayName = 'UavInfoBoardSwitchButton'

export default UavInfoBoardSwitchButton
