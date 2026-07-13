import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import TanqiFloatDialog, {
  useTanqiDialogStore,
} from '@/components/Tanqi/demo/TanqiFloatDialog'
import { useLocation } from 'react-router-dom'
import FloatIconButton from '../ui/button/FloatIconButton'
import FloatIconButtonGroup from '@/components/ui/button/FloatIconButton/FloatIconButtonGroup'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconRangeFinder from '@/assets/icons/jsx/right-tools/IconRangeFinder'
import IconSave from '@/assets/icons/jsx/IconSave'
import IconCreateFlightArea from '@/assets/icons/jsx/IconCreateFlightArea'
import { RightModeEnum, RightOuterEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import WirelessSituationTool from './components/WirelessSituationTool'
import { mapViewSaveEmitter } from '@/map/GlobalMap/MapViewSave'
import useMapDrawStore from '@/store/map/useDraw.store'
import UavInfoBoardSwitchButton from './components/UavInfoBoardSwitchButton'
import {
  RIGHT_TOOLBAR_SHIFT_WITH_OUTER,
  RIGHT_TOOLBAR_RIGHT,
} from '@/pages/right/constants'
import { useFullFlowDemoStore } from '@/demo/situation/full-flow-demo.store'
import { canSeatUseTanqi, useSeatDemoStore } from '@/demo/situation/seat-demo.store'

type PropsType = unknown

const RightTools: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
  const rightOuterMode = useRightMode((s) => s.rightOuterMode)
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateRightOuterMode = useRightMode((s) => s.updateRightOuterMode)
  const updateIsFlightArea = useMapDrawStore((s) => s.updateIsFlightArea)

  const tanqiDialogOpen = useTanqiDialogStore((s) => s.open)
  const demoPageMode = useFullFlowDemoStore((s) => s.mode)
  const seat = useSeatDemoStore((s) => s.seat)
  const { pathname } = useLocation()
  // 行动详情页已有自己的檀棋入口, 避免重复
  const showTanqiEntry =
    globalConfig.useFixedWingDemo &&
    !pathname.includes('/action/') &&
    (demoPageMode !== 'seat-demo' || canSeatUseTanqi(seat))
  const rightToolsRight = rightOuterMode
    ? RIGHT_TOOLBAR_SHIFT_WITH_OUTER
    : RIGHT_TOOLBAR_RIGHT

  const { t } = useTranslation()

  return (
    <div
      className="absolute top-3 transition-[right] duration-300"
      style={{ right: rightToolsRight }}
    >
      <div id="global-map-right-tools" className="flex flex-col gap-3">
        <FloatIconButtonGroup mode="vertical">
          <>
            <FloatIconButton
              tippyProps={{
                content: t('overlay.marker.title'),
                placement: 'left',
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.SET_POINT}
              onClick={() => updateRightMode(RightModeEnum.SET_POINT)}
            >
              <IconAddMark />
            </FloatIconButton>
            <FloatIconButton
              tippyProps={{
                content: t('overlay.drawing.title'),
                placement: 'left',
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
              tippyProps={{
                content: t('overlay.measure.title'),
                placement: 'left',
              }}
              variant="borderless"
              active={rightMode === RightModeEnum.RANGING}
              onClick={() => updateRightMode(RightModeEnum.RANGING)}
            >
              <IconRangeFinder />
            </FloatIconButton>
            <FloatIconButton
              tippyProps={{
                content: t('flightArea.create.title'),
                placement: 'left',
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
        {showTanqiEntry && (
          <FloatIconButton
            tippyProps={{ content: '檀棋', placement: 'left' }}
            active={rightOuterMode === RightOuterEnum.TANQI || tanqiDialogOpen}
            onClick={() => {
              const nextMode =
                rightOuterMode === RightOuterEnum.TANQI
                  ? null
                  : RightOuterEnum.TANQI
              updateRightOuterMode(nextMode)
              if (nextMode === RightOuterEnum.TANQI) {
                useTanqiDialogStore.getState().updateOpen(false)
              }
            }}
          >
            <IconTanQi />
          </FloatIconButton>
        )}
        <WirelessSituationTool />
        <UavInfoBoardSwitchButton />
        <FloatIconButton
          tippyProps={{
            content: t('tools.saveMapView.title'),
            placement: 'left',
          }}
          onClick={() => mapViewSaveEmitter.emit('save')}
        >
          <IconSave />
        </FloatIconButton>
      </div>
      {globalConfig.useFixedWingDemo && <TanqiFloatDialog />}
    </div>
  )
})

RightTools.displayName = 'RightTools'

export default RightTools
