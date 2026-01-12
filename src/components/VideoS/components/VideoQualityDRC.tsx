import { Select } from 'antd'

type PropsType = {
  value: string | number
  onChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
}

/** DRC 视频清晰度切换 */
const VideoQualityDRC: FC<PropsType> = memo(
  ({ value, onChange, onOpenChange }) => {
    const { t } = useTranslation()

    const optionsRaw = useMemo(
      () => [
        { label: t('common.default'), value: 'Unknown' },
        { label: t('common.autoFit'), value: '0' },
        {
          label: '720P',
          value: '3',
        },
        {
          label: '1080P',
          value: '4',
        },
      ],
      [t],
    )

    const options = useMemo(() => {
      if (+value >= 0) {
        return optionsRaw.slice(1)
      }
      return optionsRaw
    }, [value, optionsRaw])

    return (
      <Select
        variant="borderless"
        placement="topRight"
        suffixIcon={null}
        popupMatchSelectWidth={false}
        options={options}
        onChange={onChange}
        onOpenChange={onOpenChange}
        labelRender={(v) => <div className="text-fore text-xs">{v.label}</div>}
        getPopupContainer={() =>
          (document.fullscreenElement as HTMLElement) ?? document.body
        }
        value={value + ''}
      />
    )
  },
)

VideoQualityDRC.displayName = 'VideoQualityDRC'

export default VideoQualityDRC
