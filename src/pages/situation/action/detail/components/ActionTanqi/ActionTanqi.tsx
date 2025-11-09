import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { RightOuterEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { useUnmount } from 'ahooks'

type PropsType = unknown

const ActionTanqi: FC<PropsType> = memo(() => {
  const rightOuterMode = useRightMode((s) => s.rightOuterMode)

  useUnmount(() => {
    if (rightOuterMode === RightOuterEnum.TANQI) {
      const store = useRightMode.getState()
      store.updateRightOuterMode(null)
    }
  })

  return (
    <FloatIconButton
      active={rightOuterMode === RightOuterEnum.TANQI}
      toolTipProps={{ title: '檀棋', placement: 'left' }}
      onClick={() => {
        const store = useRightMode.getState()
        store.updateRightOuterMode(
          rightOuterMode === RightOuterEnum.TANQI ? null : RightOuterEnum.TANQI,
        )
      }}
    >
      <IconTanQi />
    </FloatIconButton>
  )
})

ActionTanqi.displayName = 'ActionTanqi'

export default ActionTanqi
