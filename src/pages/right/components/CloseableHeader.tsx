import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useRightMode from '@/store/layout/useRightMode.store'
import { omit } from 'lodash'

type PropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  children?: ReactNode
  /** 默认关闭 right 详情 */
  rightTools?: ReactNode
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

const CloseableHeader: FC<PropsType> = memo(
  ({ children, onClose, rightTools, ...props }) => {
    return (
      <div
        className={clsx('flex items-center px-3 py-2 gap-2', props.className)}
        {...omit(props, 'className')}
      >
        <div className="flex-1">{children}</div>
        <div className="flex items-center gap-2">
          {rightTools}
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
  },
)

CloseableHeader.displayName = 'CloseableHeader'

export default CloseableHeader
