import IconTip from '@/assets/icons/jsx/IconTip'
import useMapSettingStore from '@/store/setting/useMapSetting.store'
import { Checkbox, Radio } from 'antd'

type PropsType = unknown

const MapSetting: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const value = useMapSettingStore((s) => s.resolution)
  const setValue = useMapSettingStore((s) => s.updateResolution)

  const webgl1 = useMapSettingStore((s) => s.webgl1)
  const updateWebgl1 = useMapSettingStore((s) => s.updateWebgl1)

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
      <Radio.Group
        className="mt-3"
        options={options}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {/* <div className="my-3">
        <Checkbox
          checked={webgl1}
          onChange={(e) => updateWebgl1(e.target.checked)}
        >
          <p>WebGL 1</p>
        </Checkbox>
      </div> */}
      <div className="flex gap-2 text-fore mt-3">
        <IconTip />
        <p className="text-xs">{t('setting.map.resolution.description')}</p>
      </div>
    </div>
  )
})

MapSetting.displayName = 'MapSetting'

export default MapSetting
