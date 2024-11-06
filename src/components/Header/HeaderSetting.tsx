import { memo, type FC } from 'react'
import IconButton from '../ui/button/IconButton'
import { SettingFilled } from '@ant-design/icons'
import { Radio } from 'antd'
import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import XModal from '../XModal'
import { useBoolean } from 'ahooks'

type PropsType = unknown

const HeaderSetting: FC<PropsType> = memo(() => {
  const value = useVideoEncoderStore((s) => s.videoEncoderValue)
  const setValue = useVideoEncoderStore((s) => s.setVideoEncoderValue)

  const options = useRef([
    {
      value: '',
      label: '默认',
    },
    {
      value: 'useWCS',
      label: 'WCS',
      disabled: !supportWCSHevc || !supportWCS,
    },
    {
      value: 'useSIMD',
      label: 'SIMD',
      disabled: !supportSimd,
    },
    {
      value: 'useMSE',
      label: 'MSE',
      disabled: !supportMse,
    },
  ])

  const [settingOpen, { setTrue, setFalse }] = useBoolean(false)

  return (
    <>
      <IconButton onClick={setTrue}>
        <SettingFilled />
      </IconButton>
      <XModal
        title="设置"
        open={settingOpen}
        noPadding
        onClose={setFalse}
        width={600}
        footer={false}
      >
        <div className="p-3">
          <p>本机视频解码器</p>
          <Radio.Group
            className="mt-1"
            options={options.current}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div>
            <p className="py-1">注意</p>
            <p className="text-xs">
              默认会根据浏览器是否支持，按照WCS、MSE、Simd、Wasm的顺序自动选择解码器
            </p>
          </div>
        </div>
        {/* <div className="p-3">
          <Tabs
            type="card"
            items={[
              {
                label: '视频解码器',
                key: 'video-decoder',
                children: (
                  <div>
                    <p>本机视频解码器</p>
                    <Radio.Group
                      className="mt-1"
                      options={options.current}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                    <div>
                      <p className="py-1">注意</p>
                      <p className="text-xs">
                        默认会根据浏览器是否支持，按照WCS、MSE、Simd、Wasm的顺序自动选择解码器
                      </p>
                    </div>
                  </div>
                ),
              },
              // {
              //   label: '虚实融合',
              //   key: 'virtual-real',
              //   children: (
              //     <AppViewSuspense>
              //       <VRSetting />
              //     </AppViewSuspense>
              //   ),
              // },
            ]}
          ></Tabs>
        </div> */}
      </XModal>
    </>
  )
})

HeaderSetting.displayName = 'HeaderSetting'

export default HeaderSetting
