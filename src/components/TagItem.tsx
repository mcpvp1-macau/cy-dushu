import { memo, ReactNode, type FC } from 'react'

type PropsType = {
  label: string
  color: string
  bgColor: string
  icon?: ReactNode
  width?: string
}

const TagItem: FC<PropsType> = memo(
  ({ label, color, bgColor, icon, width }) => {
    return (
      <div
        className="text-xs inline-flex items-center gap-1 h-[18px] p-1 px-2 rounded-md"
        style={{ color, background: bgColor, width: width }}
      >
        {icon}
        <span>{label}</span>
      </div>
    )
  },
)

TagItem.displayName = 'TagItem'

export default TagItem
