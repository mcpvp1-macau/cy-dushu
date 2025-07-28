import { FC, memo } from 'react'
import XModal from '@/components/XModal'
import { Tabs } from 'antd'
import Health from './Health'
import Operation from './Operation'

type PropsType = {
  deviceId: string
  deviceName: string
  open: boolean
  onClose: () => void
}

const LogsModal: FC<PropsType> = memo(
  ({ deviceId, deviceName, open, onClose }) => {
    return (
      <XModal
        width={'70%'}
        open={open}
        onClose={onClose}
        title={`${deviceName}日志`}
      >
        <div>
          <Tabs
            items={[
              {
                label: '健康信息',
                key: 'health',
                children: <Health deviceId={deviceId} />,
              },
              {
                label: '操作日志',
                key: 'operation',
                children: <Operation deviceId={deviceId} />,
              },
            ]}
          />
        </div>
      </XModal>
    )
  },
)

LogsModal.displayName = 'LogsModal'

export default LogsModal
