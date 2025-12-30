import { Select } from 'antd'

type PropsType = {
  value: string
  onChange?: (value: string) => void
}

const VideoQuality5G: FC<PropsType> = memo(({ value, onChange }) => {
  const { t } = useTranslation()

  const options = useMemo(
    () => [
      {
        label: t('common.autoFit'),
        value: '2',
      },
      {
        label: t('common.lowDelay'),
        value: '1',
      },
      {
        label: t('common.highQuality'),
        value: '0',
      },
    ],
    [t],
  )

  return (
    <Select
      variant="borderless"
      placement="topRight"
      labelRender={(v) => <div className="text-fore text-xs">{v.label}</div>}
      suffixIcon={null}
      popupMatchSelectWidth={false}
      options={options}
      value={value}
      onChange={onChange}
      getPopupContainer={(e) => e.parentElement}
    />
  )
})

VideoQuality5G.displayName = 'VideoQuality5G'

export default VideoQuality5G
