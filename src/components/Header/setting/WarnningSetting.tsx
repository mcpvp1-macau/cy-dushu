import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'
import { Switch } from 'antd'

const WarnningSetting = () => {
  const isAddMap = useWarnningSettingStore((s) => s.isAddMap)
  const updateIsAddMap = useWarnningSettingStore((s) => s.updateIsAddMap)

  const isHaveAvdio = useWarnningSettingStore((s) => s.isHaveAvdio)
  const updateIsHaveAvdio = useWarnningSettingStore((s) => s.updateIsHaveAvdio)

  const isHaveLight = useWarnningSettingStore((s) => s.isHaveLight)
  const updateIsHaveLight = useWarnningSettingStore((s) => s.updateIsHaveLight)

  const { t } = useTranslation()

  return (
    <div className="mt-[10px]">
      <span>
        <span className="leading-[30px]">{t('setting.warnning.isAddMap')}</span>
        <Switch
          value={isAddMap}
          onChange={updateIsAddMap}
          size="small"
          className="ml-[8px]"
        />
      </span>
      <span className="ml-[20px]">
        <span>{t('setting.warnning.isHaveAvdio')}</span>
        <Switch
          value={isHaveAvdio}
          onChange={updateIsHaveAvdio}
          size="small"
          className="ml-[8px]"
        />
      </span>
      <span className="ml-[20px]">
        <span>{t('setting.warnning.isHaveLight')}</span>
        <Switch
          value={isHaveLight}
          onChange={updateIsHaveLight}
          size="small"
          className="ml-[8px]"
        />
      </span>
    </div>
  )
}

export default WarnningSetting
