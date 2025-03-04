import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useRightMode from '@/store/layout/useRightMode.store'

type PropsType = {
  children?: ReactNode
  /** 默认关闭 right 详情 */
  onClose?: () => void
}

const DefaultClose = () => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)
  return (
    <IconButton
      className="text-xl"
      onClick={() => {
        updateRightMode(null)
        updateDetailId(null)
      }}
    >
      <IconClose />
    </IconButton>
  )
}

const CloseableHeader: FC<PropsType> = memo(({ children, onClose }) => {
  return (
    <div className="flex items-center px-3 py-2 gap-2">
      <div className="flex-1">{children}</div>
      <div className="flex items-center">
        {onClose ? (
          <IconButton className="text-xl" onClick={onClose}>
            <IconClose />
          </IconButton>
        ) : (
          <DefaultClose />
        )}
      </div>
    </div>
  )
})

CloseableHeader.displayName = 'CloseableHeader'

export default CloseableHeader
