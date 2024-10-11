import { Select } from 'antd'
import { memo, type FC } from 'react'

const optionsRaw = [
  { label: '默认', value: 'Unknown' },
  { label: '自适应', value: '0' },
  {
    label: '720P',
    value: '3',
  },
  {
    label: '1080P',
    value: '4',
  },
]

type PropsType = { value: string | number; onChange?: (value: string) => void }

const VideoQualityDRC: FC<PropsType> = memo(({ value, onChange }) => {
  const options = useMemo(() => {
    if (+value >= 0) {
      return optionsRaw.slice(1)
    }
    return optionsRaw
  }, [value])

  return (
    <Select
      variant="borderless"
      placement="topRight"
      suffixIcon={null}
      popupMatchSelectWidth={false}
      options={options}
      onChange={onChange}
      labelRender={(v) => <div className="text-fore">{v.label}</div>}
      getPopupContainer={() =>
        (document.fullscreenElement as HTMLElement) ?? document.body
      }
      value={value + ''}
    />
  )
})

VideoQualityDRC.displayName = 'VideoQualityDRC'

export default VideoQualityDRC
