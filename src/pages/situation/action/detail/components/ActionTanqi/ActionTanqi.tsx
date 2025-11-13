import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { RightOuterEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { useUnmount } from 'ahooks'
import { createPortal } from 'react-dom'

type PropsType = unknown

const ActionTanqi: FC<PropsType> = memo(() => {
  const rightOuterMode = useRightMode((s) => s.rightOuterMode)

  useUnmount(() => {
    if (rightOuterMode === RightOuterEnum.TANQI) {
      const store = useRightMode.getState()
      store.updateRightOuterMode(null)
    }
  })

  // 可能 global-map-right-tools 还没渲染好，延迟一下渲染
  const [render, setRender] = useState(false)

  useEffect(() => {
    setRender(true)
  }, [])

  if (!render) {
    return null
  }

  return createPortal(
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
    </FloatIconButton>,
    document.getElementById('global-map-right-tools')!,
  )
})

ActionTanqi.displayName = 'ActionTanqi'

export default ActionTanqi
