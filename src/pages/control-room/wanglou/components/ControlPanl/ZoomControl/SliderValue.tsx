import {
  Button,
  ConfigProvider,
  Flex,
  InputNumber,
  Slider,
  SliderSingleProps,
} from 'antd'
import React from 'react'
import Icon from '@/components/Icon'

interface Props {
  disabled: boolean
  value?: number
  onChange?: (value: number) => void
  sliderProps: SliderSingleProps
  title: string
  unit: string
}

const SliderValue: React.FC<Props> = (props) => {
  const { title, disabled, value, onChange, sliderProps, unit } = props
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
          <Flex>
            <InputNumber
              value={value}
              disabled={disabled}
              onChange={(value) => {
                onChange?.(value || 0)
              }}
              size="small"
              style={{ width: 50 }}
            />
            <div className='ml-[12px] leading-[24px]'>{unit}</div>
          </Flex>
        </Flex>
        <Flex justify="space-between" gap={12} style={{ width: '100%' }}>
          <Button
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                onChange?.(value! - 1)
              }
            }}
            size='small'
            style={{ padding: '0px 6px', marginTop: '6px',width:'20px', height:'20px' }}
          >
            <Icon id="icon-cuxian" />
          </Button>
          <Slider
            {...sliderProps}
            style={{ flex: 1 }}
            disabled={disabled}
            keyboard={false}
          />
          <Button
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                onChange?.(value! + 1)
              }
            }}
            size='small'
            style={{ padding: '0px 6px', marginTop: '6px' ,width:'20px', height:'20px' }}
          >
            <Icon id="icon-jia" />
          </Button>
        </Flex>
      </Flex>
    </ConfigProvider>
  )
}

export default React.memo(SliderValue)
