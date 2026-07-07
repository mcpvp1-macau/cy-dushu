import { InboxOutlined } from '@ant-design/icons'

type PropsType = unknown

/** 右侧页签空状态 (原型 right-empty: 暂无数据) */
const RightEmptyPanel: FC<PropsType> = memo(() => {
  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-fore opacity-40">
        <InboxOutlined className="text-3xl" />
        <span className="text-xs">暂无数据</span>
      </div>
    </div>
  )
})

RightEmptyPanel.displayName = 'RightEmptyPanel'

export default RightEmptyPanel
