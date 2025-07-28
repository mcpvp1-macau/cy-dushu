import React from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import useUserStore from '@/store/useUser.store'

const UploadDetail: React.FC = () => {
  const queryClient = useQueryClient()
  const { token } = useUserStore.getState()
  return (
    <Upload
      accept=".xlsx"
      showUploadList={false}
      action={`/proxyApi/otherService/${globalConfig.systemName}/jingqiServer/device/doc/import`}
      headers={{
        Authorization: `Bearer ${token}`,
      }}
      onChange={(info) => {
        if (info.file.status === 'done') {
          if (info.file.response === '导入成功') {
            message.success('上传成功')
            queryClient.invalidateQueries({ queryKey: ['getUavDocSnList'] })
          }
        }
      }}
    >
      <Button icon={<UploadOutlined />}>上传一机一档</Button>
    </Upload>
  )
}

export default UploadDetail
