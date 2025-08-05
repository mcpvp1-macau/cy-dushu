import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import FloatIconButton from '../ui/button/FloatIconButton'
import FloatIconButtonGroup from '@/components/ui/button/FloatIconButton/FloatIconButtonGroup'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconRangeFinder from '@/assets/icons/jsx/right-tools/IconRangeFinder'
import IconSave from '@/assets/icons/jsx/IconSave'
import IconCreateFlightArea from '@/assets/icons/jsx/IconCreateFlightArea'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import WirelessSituationTool from './components/WirelessSituationTool'
import { mapViewSaveEmitter } from '@/map/GlobalMap/MapViewSave'
import useMapDrawStore from '@/store/map/useDraw.store'
import UavInfoBoardSwitchButton from './components/UavInfoBoardSwitchButton'

type PropsType = unknown

const RightTools: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateIsFlightArea = useMapDrawStore((s) => s.updateIsFlightArea)

  const { t } = useTranslation()

  return (
    <div className="absolute top-3 right-3">
      <div id="global-map-right-tools" className="flex flex-col gap-3">
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
              onClick={() => {
                updateRightMode(RightModeEnum.DRAW_GEOMETRY)
                updateIsFlightArea(false)
              }}
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
            <FloatIconButton
              toolTipProps={{
                title: t('flightArea.create.title'),
                placement: 'left',
                mouseEnterDelay: 0.5,
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.DRAW_FLIGHT_AREA}
              onClick={() => {
                updateRightMode(RightModeEnum.DRAW_FLIGHT_AREA)
                updateIsFlightArea(true)
              }}
            >
              <IconCreateFlightArea />
            </FloatIconButton>
          </>
        </FloatIconButtonGroup>
        <WirelessSituationTool />
        <UavInfoBoardSwitchButton />
        <FloatIconButton
          toolTipProps={{
            title: t('tools.saveMapView.title'),
            placement: 'left',
          }}
          onClick={() => mapViewSaveEmitter.emit('save')}
        >
          <IconSave />
        </FloatIconButton>
      </div>
    </div>
  )
})

RightTools.displayName = 'RightTools'

export default RightTools
