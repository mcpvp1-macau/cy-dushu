import { twMerge } from 'tailwind-merge'

type PropsType = {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error' | string
  /** 标签内容 */
  children: React.ReactNode
  /** 自定义颜色 覆盖 type 默认颜色 */
  color?: string
  /** 自定义背景色 覆盖 type 默认背景色 */
  bgColor?: string
  /** 自定义图标 覆盖 type 默认图标 */
  icon?: React.ReactNode
  className?: string
}

const TagItemV2: FC<PropsType> = memo((props) => {
  const type = props.type || 'default'

  return (
    <div
      className={twMerge(
        clsx(
          'text-xs inline-flex items-center gap-1 h-[18px] p-1 px-2 rounded-[3px] whitespace-nowrap',
          {
            'text-fore bg-fore/20': type === 'default',
            'text-primary bg-primary/20': type === 'primary',
            'text-green-500 bg-green-500/20': type === 'success',
            'text-orange-500 bg-orange-500/20': type === 'warning',
            'text-red-500 bg-red-500/20': type === 'error',
          },
          props.className,
        ),
      )}
      style={{ color: props.color, background: props.bgColor }}
    >
      {props.icon}
      {props.children}
    </div>
  )
})

TagItemV2.displayName = 'TagItemV2'

export default TagItemV2
