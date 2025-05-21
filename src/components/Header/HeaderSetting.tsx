import IconButton from '../ui/button/IconButton'
import { SettingFilled } from '@ant-design/icons'
import XModal from '../XModal'
import { useBoolean } from 'ahooks'
import VideoDecoder from './setting/VideoDecoder'
import { Tabs } from 'antd'
import MapSetting from './setting/MapSetting'
import WarnningSetting from './setting/WarnningSetting'
import SystemSetting from './setting/SystemSetting'
import SourceSetting from './setting/SourceSetting'
type PropsType = unknown

const HeaderSetting: FC<PropsType> = memo(() => {
  const [settingOpen, { setTrue, setFalse }] = useBoolean(false)

  const { t } = useTranslation()

  const [activeKey, setActiveKey] = useState('video_decoder')

  return (
    <>
      <IconButton onClick={setTrue}>
        <SettingFilled />
      </IconButton>
      <XModal
        title={t('setting.title')}
        open={settingOpen}
        noPadding
        onClose={setFalse}
        width={600}
        footer={false}
        destroyOnClose
      >
        <div className="p-3">
          <Tabs
            destroyInactiveTabPane
            activeKey={activeKey}
            onChange={setActiveKey}
            items={[
              {
                key: 'video_decoder',
                label: t('setting.video_decoder.title'),
                children: <VideoDecoder />,
              },
              {
                key: 'map_setting',
                label: t('setting.map.title'),
                children: <MapSetting />,
              },
              {
                key: 'warnning_setting',
                label: t('setting.warnning.title'),
                children: <WarnningSetting />,
              },
              {
                key: 'system_setting',
                label: t('setting.system.title'),
                children: <SystemSetting />,
              },
              {
                key: 'source_setting',
                label: '资源',
                children: <SourceSetting />,
              },
            ]}
          />
        </div>
      </XModal>
    </>
  )
})

HeaderSetting.displayName = 'HeaderSetting'

export default HeaderSetting
