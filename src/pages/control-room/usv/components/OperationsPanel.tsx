import { Empty } from 'antd'

const OperationsPanel: FC = memo(() => {
  return (
    <div className="flex size-full items-center justify-center">
      <Empty description={'操作面板待配置'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  )
})

OperationsPanel.displayName = 'OperationsPanel'

export default OperationsPanel
