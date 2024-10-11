import { memo, type FC, ReactNode } from 'react'
// import { useModel } from '@umijs/max';

type PropsType = {
  open: boolean
  children?: ReactNode
  color?: string
  background?: string
}

const SnackBar: FC<PropsType> = ({
  open,
  children,
  color = 'white',
  background = 'rgba(0, 0, 0, 0.6)',
}) => {
  // const { leftHide } = useModel('leftNav', (m) => pick(m, 'leftHide'));
  const leftHide = false

  return null
  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '132px',
            left: `calc(50% + 19px + ${leftHide ? 0 : 175}px)`,
            transform: 'translateX(-50%)',
            color,
            background,
            padding: '12px 24px',
            borderRadius: '3px',
          }}
        >
          {children}
        </div>
      )}
    </>
  )
}

const memorizedCpn = memo(SnackBar)
memorizedCpn.displayName = 'SnackBar'

export default memorizedCpn
