import { Collapse, CollapseProps } from 'antd'
import { saveAs } from 'file-saver'
import { DownloadOutlined } from '@ant-design/icons'
import useUserStore from '@/store/useUser.store'
const SourceSetting: React.FC = () => {
  const { systemInfo } = useUserStore()
  const mock = systemInfo?.config?.sourceDownloadSettings || []
  const items: CollapseProps['items'] = mock.map((e) => {
    return {
      key: e.key,
      label: e.label,
      children: e.children.map((item) => {
        return (
          <div className="ml-4">
            <div className="flex items-center">
              <label className="w-[180px]">{item.label}：</label>
              <span
                className="hover:text-blue-500 cursor-pointer"
                onClick={() => saveAs(item.downloadUrl, item.fileName)}
              >
                {item.fileName} <DownloadOutlined />
              </span>
            </div>
          </div>
        )
      }),
    }
  })

  return (
    <div className="mt-4">
      <Collapse defaultActiveKey={mock.map((e) => e.key)} ghost items={items} />
    </div>
  )
}

export default SourceSetting
