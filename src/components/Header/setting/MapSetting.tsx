import useMapSettingStore from '@/store/setting/useMapSetting.store'
import { Radio } from 'antd'

type PropsType = unknown

const MapSetting: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const value = useMapSettingStore((s) => s.resolution)
  const setValue = useMapSettingStore((s) => s.updateResolution)

  const options = [
    {
      value: '0',
      label: t('setting.map.resolution.smooth'),
    },
    {
      value: '1',
      label: t('setting.map.resolution.standard'),
    },
    {
      value: '2',
      label: t('setting.map.resolution.default'),
    },
    {
      value: '3',
      label: t('setting.map.resolution.high'),
    },
    {
      value: '4',
      label: t('setting.map.resolution.super'),
    },
    {
      value: '5',
      label: t('setting.map.resolution.ultra'),
    },
  ]

  return (
    <div>
      <p>{t('setting.map.resolution.title')}</p>
      <Radio.Group
        className="mt-1"
        options={options}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
})

MapSetting.displayName = 'MapSetting'

export default MapSetting
