import { Button, ConfigProvider, Flex } from 'antd'
import React from 'react'
import Icon from '@/components/Icon'

interface Props {
  disabled: boolean
  onChange?: (value: number | null) => void
  title: string
}

const SliderValue: React.FC<Props> = (props) => {
  const { title, disabled, onChange } = props
  const [value, setValue] = useState<number | null>(null)
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: '#ffffff', // 拖拽点填充色
          colorPrimary: '#4C90F0', // 拖拽点变大色
          colorPrimaryBorderHover: '#4C90F0', // 拖拽点边框hover色
          colorPrimaryBorder: '#4C90F0', // 拖拽点边框色
          colorFillSecondary: '#363F4B', // 滚动条轨道hover色
          colorFillTertiary: '#363F4B', // 滚动条轨道色
        },
      }}
    >
      <Flex vertical style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <div>{title}</div>
        </Flex>
        <Flex justify="left" gap={12} style={{ width: '100%' }}>
          <Button
            disabled={disabled}
            onMouseDown={() => {
              setValue(-1)
              if (!disabled) {
                onChange?.(-1)
              }
            }}
            onMouseLeave={() => {
              if (value !== null && !disabled) {
                onChange?.(null)
              }
              setValue(null)
            }}
            onMouseUp={() => {
              if (value !== null && !disabled) {
                onChange?.(null)
              }
              setValue(null)
            }}
            style={{ padding: '0px 6px', marginTop: '4px' }}
          >
            <Icon id="icon-cuxian" />
          </Button>
          <Button
            disabled={disabled}
            onMouseDown={() => {
              setValue(1)
              if (!disabled) {
                onChange?.(1)
              }
            }}
            onMouseLeave={() => {
              if (value !== null && !disabled) {
                onChange?.(null)
              }
              setValue(null)
            }}
            onMouseUp={() => {
              if (value !== null && !disabled) {
                onChange?.(null)
              }
              setValue(null)
            }}
            style={{ padding: '0px 6px', marginTop: '4px' }}
          >
            <Icon id="icon-jia" />
          </Button>
        </Flex>
      </Flex>
    </ConfigProvider>
  )
}

export default React.memo(SliderValue)
