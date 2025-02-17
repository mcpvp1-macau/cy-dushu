import IconButton from '../ui/button/IconButton'
import { SettingFilled } from '@ant-design/icons'
import XModal from '../XModal'
import { useBoolean } from 'ahooks'
import VideoDecoder from './setting/VideoDecoder'
import { Button, Tabs } from 'antd'
import MapSetting from './setting/MapSetting'
import WarnningSetting from './setting/WarnningSetting'

type PropsType = unknown

const HeaderSetting: FC<PropsType> = memo(() => {
  const [settingOpen, { setTrue, setFalse }] = useBoolean(false)

  const { t } = useTranslation()

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
      >
        <div className="p-3">
          <Tabs
            items={[
              {
                key: 'video_decoder',
                label: t('setting.video_decoder.title'),
                children: (
                  <div className="mt-1">
                    <VideoDecoder />
                  </div>
                ),
              },
              {
                key: 'map_setting',
                label: t('setting.map.title'),
                children: (
                  <div className="mt-1">
                    <MapSetting />
                  </div>
                ),
              },
              {
                key: 'warnning_setting',
                label: t('setting.warnning.title'),
                children: (
                  <div className="mt-1">
                    <WarnningSetting />
                  </div>
                ),
              },
              {
                key: 'system_setting',
                label: t('setting.system.title'),
                children: (
                  <div className="mt-3 text-center">
                    <Button
                      onClick={() => {
                        localStorage.clear()
                        sessionStorage.clear()
                        window.location.reload()
                      }}
                    >
                      {t('setting.system.clearLocalData')}
                    </Button>
                  </div>
                ),
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
