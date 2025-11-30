import IconTip from '@/assets/icons/jsx/IconTip'
import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'
import { Switch } from 'antd'
import { useTranslation } from 'react-i18next'

const WarnningSetting = () => {
  const s = useWarnningSettingStore((s) => s)

  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="flex gap-4 flex-wrap">
        {[
          [
            'isAllowEventNotification',
            s.isAllowEventNotification,
            s.updateIsAllowEventNotification,
          ] as const,
          [
            'isAllowAlarmNotification',
            s.isAllowAlarmNotification,
            s.updateIsAllowAlarmNotification,
          ] as const,
          ['isAddMap', s.isAddMap, s.updateIsAddMap] as const,
          ['isHaveAvdio', s.isHaveAvdio, s.updateIsHaveAvdio] as const,
          ['isHaveLight', s.isHaveLight, s.updateIsHaveLight] as const,
        ].map(([key, value, updateFn]) => (
          <div key={key} className="flex gap-2 items-center">
            <span>{t(`setting.warnning.${key}`)}</span>
            <Switch value={value} onChange={updateFn} size="small" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 text-fore mt-3">
        <IconTip />
        <p className="text-xs">{t('setting.warning.description')}</p>
      </div>
    </div>
  )
}

export default WarnningSetting
