import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import FloatIconButton from '../ui/button/FloatIconButton'
import FloatIconButtonGroup from '@/components/ui/button/FloatIconButton/FloatIconButtonGroup'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconRangeFinder from '@/assets/icons/jsx/right-tools/IconRangeFinder'
import IconSave from '@/assets/icons/jsx/IconSave'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import WirelessSituationTool from './components/WirelessSituationTool'
import { mapViewSaveEmitter } from '@/map/GlobalMap/MapViewSave'

type PropsType = unknown

const RightTools: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
  const updateRightMode = useRightMode((s) => s.updateRightMode)

  return (
    <div className="absolute top-3 right-3">
      <div className="flex flex-col gap-3">
        <FloatIconButtonGroup mode="vertical">
          <>
            <FloatIconButton
              toolTipProps={{
                title: '打点',
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
                title: '画区',
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
                title: '测距',
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
        <FloatIconButton
          toolTipProps={{ title: '保存地图视角', placement: 'left' }}
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
