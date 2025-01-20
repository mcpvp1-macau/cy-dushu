import { createPortal } from 'react-dom'

type PropsType = {
  open: boolean
  children?: ReactNode
  color?: string
  background?: string
}

const SnackBar: FC<PropsType> = memo(
  ({ open, children, color = 'white', background = 'rgba(0, 0, 0, 0.6)' }) => {
    return (
      open &&
      createPortal(
        <div
          className="fixed z-[60] bottom-6 rounded left-1/2 -translate-x-1/2 p-3 px-6 whitespace-nowrap"
          style={{
            color,
            background,
          }}
        >
          {children}
        </div>,
        document.body,
        'snackbar',
      )
    )
  },
)

SnackBar.displayName = 'SnackBar'

export default SnackBar
