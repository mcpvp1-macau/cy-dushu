import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import FloatIconButtonGroup from '@/components/ui/button/FloatIconButton/FloatIconButtonGroup'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconRangeFinder from '@/assets/icons/jsx/right-tools/IconRangeFinder'
import { RightModeEnum } from '@/enum/right-mode'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { useUavControlRoomLayoutStore } from '@/pages/control-room/uav/hooks/useUavControlRoomLayout.store'
import WirelessSituationTool from '@/components/right-tools/components/WirelessSituationTool'

type PropsType = unknown

const RightTools: FC<PropsType> = memo(() => {
  const rightMode = useUavControlRoomLayoutStore((s) => s.mapRight)
  const updateRightMode = useUavControlRoomLayoutStore((s) => s.updateMapRight)

  const { t } = useTranslation()

  return (
    <div className="absolute top-3 right-3">
      <div className="flex flex-col gap-3">
        <FloatIconButtonGroup mode="vertical">
          <>
            <FloatIconButton
              toolTipProps={{
                title: t('overlay.marker.title'),
                placement: 'left',
                mouseEnterDelay: 0.5,
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.SET_POINT}
              onClick={() => updateRightMode(RightModeEnum.SET_POINT)}
            >
              <IconAddMark />
            </FloatIconButton>
            <FloatIconButton
              toolTipProps={{
                title: t('overlay.drawing.title'),
                placement: 'left',
                mouseEnterDelay: 0.5,
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.DRAW_GEOMETRY}
              onClick={() => updateRightMode(RightModeEnum.DRAW_GEOMETRY)}
            >
              <IconDrawArea />
            </FloatIconButton>
            <FloatIconButton
              toolTipProps={{
                title: t('overlay.measure.title'),
                placement: 'left',
                mouseEnterDelay: 0.5,
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.RANGING}
              onClick={() => updateRightMode(RightModeEnum.RANGING)}
            >
              <IconRangeFinder />
            </FloatIconButton>
          </>
        </FloatIconButtonGroup>
        <WirelessSituationTool />
      </div>
    </div>
  )
})

RightTools.displayName = 'RightTools'

export default RightTools
