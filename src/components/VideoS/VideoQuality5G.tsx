import { Select } from 'antd'
import { memo, type FC } from 'react'

const options = [
  {
    label: '自适应',
    value: '2',
  },
  {
    label: '低延时',
    value: '1',
  },
  {
    label: '高质量',
    value: '0',
  },
]

type PropsType = {
  value: string
  onChange?: (value: string) => void
}

const VideoQuality5G: FC<PropsType> = memo(({ value, onChange }) => {
  return (
    <Select
      variant="borderless"
      placement="topRight"
      labelRender={(v) => <div className="text-fore">{v.label}</div>}
      suffixIcon={null}
      popupMatchSelectWidth={false}
      options={options}
      value={value}
      onChange={onChange}
      getPopupContainer={() =>
        (document.fullscreenElement as HTMLElement) ?? document.body
      }
    />
  )
})

VideoQuality5G.displayName = 'VideoQuality5G'

export default VideoQuality5G
