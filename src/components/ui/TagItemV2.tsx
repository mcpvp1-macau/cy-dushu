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
}

const defaultColorMap: Record<string, string> = {
  default: '#c7d1dc',
  primary: '#4c90f0',
  success: '#0f9960',
  warning: '#d9822b',
  error: '#dd4444',
}

const TagItemV2: FC<PropsType> = memo((props) => {
  const foreColor = props.color || defaultColorMap[props.type || 'default']
  const bgColor =
    props.bgColor || `${defaultColorMap[props.type || 'default']}33`

  return (
    <div
      className="text-xs inline-flex items-center gap-1 h-[18px] p-1 px-2 rounded-[3px]"
      style={{ color: foreColor, background: bgColor }}
    >
      {props.icon}
      {props.children}
    </div>
  )
})

TagItemV2.displayName = 'TagItemV2'

export default TagItemV2
