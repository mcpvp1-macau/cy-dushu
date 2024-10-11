import { memo, type FC } from 'react'
import IconButton from '../ui/button/IconButton'
import { QuestionCircleFilled, SettingFilled } from '@ant-design/icons'
import { ColorPicker, InputNumber, Radio, Switch, Tabs, Tooltip } from 'antd'
import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import XModal from '../XModal'
import { useBoolean } from 'ahooks'
import useSettingStore from '@/store/useSetting.store'

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

  const vr = useSettingStore((s) => s.virtualReal)
  const updVr = useSettingStore((s) => s.updateVirtualReal)

  return (
    <>
      <IconButton onClick={setTrue}>
        <SettingFilled />
      </IconButton>
      <XModal title="设置" open={settingOpen} noPadding onClose={setFalse}>
        <div className="p-3">
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
              {
                label: '虚实融合',
                key: 'virtual-real',
                children: (
                  <div className="flex flex-col gap-3 mt-2 text-fore">
                    <section className="flex flex-wrap items-center">
                      <div className="flex items-center gap-2 w-1/3">
                        <span>道路颜色</span>
                        <ColorPicker
                          size="small"
                          value={vr.roadColor}
                          onChange={(v) =>
                            updVr({ roadColor: v.toHexString() })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>建筑背景颜色</span>
                        <ColorPicker
                          size="small"
                          value={vr.buildingBackgroundColor}
                          onChange={(v) =>
                            updVr({ buildingBackgroundColor: v.toHexString() })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>建筑线条颜色</span>
                        <ColorPicker
                          size="small"
                          value={vr.buildingLineColor}
                          onChange={(v) =>
                            updVr({ buildingLineColor: v.toHexString() })
                          }
                        />
                      </div>
                    </section>
                    <div className="h-[1px] bg-ground-250" />
                    <section className="flex flex-wrap items-center">
                      <div className="flex items-center gap-2 w-1/3">
                        <span>道路粗细</span>
                        <InputNumber
                          size="small"
                          suffix="px"
                          value={vr.roadWidth}
                          onChange={(v) => v && updVr({ roadWidth: v })}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>建筑粗细</span>
                        <InputNumber
                          size="small"
                          suffix="px"
                          value={vr.buildingWidth}
                          onChange={(v) => v && updVr({ buildingWidth: v })}
                        />
                      </div>
                    </section>
                    <div className="h-[1px] bg-ground-250" />
                    <section className="flex flex-wrap items-center">
                      <div className="flex items-center gap-2 w-1/3">
                        <span>展示道路</span>
                        <Switch
                          size="small"
                          value={vr.showRoad}
                          onChange={(e) => {
                            updVr({ showRoad: e })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>
                          展示小路
                          <Tooltip title="未命名的道路">
                            <QuestionCircleFilled className="ml-1" />
                          </Tooltip>
                        </span>
                        <Switch
                          size="small"
                          value={vr.showSmallRoad}
                          onChange={(e) => {
                            updVr({ showSmallRoad: e })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>展示建筑</span>
                        <Switch
                          size="small"
                          value={vr.showBuilding}
                          onChange={(e) => {
                            updVr({ showBuilding: e })
                          }}
                        />
                      </div>
                    </section>
                    <div className="h-[1px] bg-ground-250" />
                    <section className="flex flex-wrap items-center gap-y-2">
                      <div className="flex items-center gap-2 w-1/3">
                        <span>文字大小</span>
                        <InputNumber
                          size="small"
                          suffix="px"
                          value={vr.textSize}
                          onChange={(e) => {
                            e && updVr({ textSize: e })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>文字颜色</span>
                        <ColorPicker
                          size="small"
                          value={vr.textColor}
                          onChange={(e) => {
                            updVr({ textColor: e.toHexString() })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>文字描边</span>
                        <InputNumber
                          size="small"
                          suffix="px"
                          value={vr.textOutlineWidth}
                          onChange={(e) => {
                            e && updVr({ textOutlineWidth: e })
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <span>文字描边色</span>
                        <ColorPicker
                          size="small"
                          value={vr.textOutlineColor}
                          onChange={(e) => {
                            updVr({ textOutlineColor: e.toHexString() })
                          }}
                        />
                      </div>
                    </section>
                  </div>
                ),
              },
            ]}
          ></Tabs>
        </div>
      </XModal>
    </>
  )
})

HeaderSetting.displayName = 'HeaderSetting'

export default HeaderSetting
