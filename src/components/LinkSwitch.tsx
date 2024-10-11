import { Button } from 'antd'
import { Fragment } from 'react'

type PropsType = {
  items: { label: ReactNode; value: string }[]
  value?: string
  onChange?: (type: string) => void
}

/** 以 | 为分割的 Tab 切换器 */
const LinkSwitch: FC<PropsType> = memo(({ items, value = '', onChange }) => {
  return (
    <div className="flex gap-1 text-fore items-center">
      {items.map((e, i) => (
        <Fragment key={e.value}>
          {i > 0 && <div className="block h-[10px] w-[1px] bg-neutral-300" />}
          <Button
            size="small"
            className={clsx('p-0', {
              'text-white': value !== e.value,
            })}
            type="link"
            onClick={(evt) => {
              evt.stopPropagation()
              onChange?.(e.value)
            }}
          >
            {e.label}
          </Button>
        </Fragment>
      ))}
    </div>
  )
})

LinkSwitch.displayName = 'LinkSwitch'

export default LinkSwitch
