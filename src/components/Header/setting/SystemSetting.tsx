import IconClear from '@/assets/icons/jsx/IconClear'
import IconTip from '@/assets/icons/jsx/IconTip'
import IconButton from '@/components/ui/button/IconButton'

const SystemSetting = () => {
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="flex justify-center">
        <IconButton
          onClick={() => {
            localStorage.clear()
            sessionStorage.clear()
            window.location.reload()
          }}
        >
          <div>
            <IconClear className="scale-150" />
            <p>{t('setting.system.clear.title')}</p>
          </div>
        </IconButton>
      </div>
      <div className="flex gap-2 text-fore mt-3">
        <IconTip />
        <p className="text-xs">{t('setting.system.clear.description')}</p>
      </div>
    </div>
  )
}

export default SystemSetting
