import { memo, type FC } from 'react'

type PropsType = {
  mode?: 'horizontal' | 'vertical'
  children?: ReactNode
}

const FloatIconButtonGroup: FC<PropsType> = memo(
  ({ children, mode = 'horizontal' }) => {
    return (
      <div
        className={clsx(
          'flex items-center rounded gap-[1px] bg-ground-4 overflow-hidden shadow',
          'border border-solid border-ground-4',
          {
            'flex-col': mode === 'vertical',
          },
        )}
      >
        {children}
      </div>
    )
  },
)

FloatIconButtonGroup.displayName = 'FloatIconButtonGroup'

export default FloatIconButtonGroup
