import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useRightMode from '@/store/layout/useRightMode.store'

type PropsType = {
  children?: ReactNode
}

const CloseableHeader: FC<PropsType> = memo(({ children }) => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  return (
    <div className="flex items-center px-3 py-2 gap-2">
      <div className="flex-1">{children}</div>
      <div className="flex items-center">
        <IconButton
          onClick={() => {
            updateRightMode(null)
            updateDetailId(null)
          }}
        >
          <IconClose className="scale-[130%]" />
        </IconButton>
      </div>
    </div>
  )
})

CloseableHeader.displayName = 'CloseableHeader'

export default CloseableHeader
