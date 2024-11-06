import IconButton from '@/components/ui/button/IconButton'
import useSettingStore from '@/store/useSetting.store'
import { UndoOutlined } from '@ant-design/icons'
import { Col, ColorPicker, Form, InputNumber, Row, Slider, Switch } from 'antd'
import { isNil } from 'lodash'

type PropsType = unknown

/** 虚实融合相关设置 */
const VRSetting: FC<PropsType> = memo(() => {
  const vr = useSettingStore((s) => s.virtualReal)
  const updVr = useSettingStore((s) => s.updateVirtualReal)

  const updateMainRoad = (data: Partial<(typeof vr)['mainRoad']>) => {
    updVr({
      ...vr,
      mainRoad: {
        ...vr.mainRoad,
        ...data,
      },
    })
  }

  const updateSubRoad = (data: Partial<(typeof vr)['subRoad']>) => {
    updVr({
      ...vr,
      subRoad: {
        ...vr.subRoad,
        ...data,
      },
    })
  }

  const updateText = (data: Partial<(typeof vr)['text']>) => {
    updVr({
      ...vr,
      text: {
        ...vr.text,
        ...data,
      },
    })
  }

  const updateBuilding = (data: Partial<(typeof vr)['building']>) => {
    updVr({
      ...vr,
      building: {
        ...vr.building,
        ...data,
      },
    })
  }

  const updateShift = (data: Partial<(typeof vr)['shift']>) => {
    updVr({
      ...vr,
      shift: {
        ...vr.shift,
        ...data,
      },
    })
  }

  return (
    <div className="flex flex-col gap-3 mt-2 text-fore">
      <Form layout="horizontal" size="small" colon={false}>
        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          主路
          <Form.Item noStyle>
            <Switch
              value={vr.mainRoad.enable}
              onChange={(e) =>
                updateMainRoad({
                  enable: e,
                })
              }
            />
          </Form.Item>
        </div>
        <Row>
          <Col span={12}>
            <Form.Item label="主路颜色">
              <ColorPicker
                value={vr.mainRoad.color}
                onChange={(e) =>
                  updateMainRoad({
                    color: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="主路宽度">
              <InputNumber
                suffix="px"
                value={vr.mainRoad.size}
                onChange={(e) =>
                  !isNil(e) &&
                  updateMainRoad({
                    size: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边颜色">
              <ColorPicker
                value={vr.mainRoad.borderColor}
                onChange={(e) =>
                  updateMainRoad({
                    borderColor: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边宽度">
              <InputNumber
                suffix="px"
                value={vr.mainRoad.borderSize}
                onChange={(e) =>
                  !isNil(e) &&
                  updateMainRoad({
                    borderSize: e,
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          小路
          <Form.Item noStyle>
            <Switch
              value={vr.subRoad.enable}
              onChange={(e) =>
                updateSubRoad({
                  enable: e,
                })
              }
            />
          </Form.Item>
        </div>
        <Row>
          <Col span={12}>
            <Form.Item label="小路颜色">
              <ColorPicker
                value={vr.subRoad.color}
                onChange={(e) =>
                  updateSubRoad({
                    color: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="小路宽度">
              <InputNumber
                suffix="px"
                value={vr.subRoad.size}
                onChange={(e) =>
                  !isNil(e) &&
                  updateSubRoad({
                    size: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边颜色">
              <ColorPicker
                value={vr.subRoad.borderColor}
                onChange={(e) =>
                  updateSubRoad({
                    borderColor: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边宽度">
              <InputNumber
                suffix="px"
                value={vr.subRoad.borderSize}
                onChange={(e) =>
                  !isNil(e) &&
                  updateSubRoad({
                    borderSize: e,
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          文本
          <Form.Item noStyle>
            <Switch
              value={vr.text.enable}
              onChange={(e) =>
                updateText({
                  enable: e,
                })
              }
            />
          </Form.Item>
        </div>
        <Row>
          <Col span={12}>
            <Form.Item label="文本颜色">
              <ColorPicker
                value={vr.text.color}
                onChange={(e) =>
                  updateText({
                    color: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="文本大小">
              <InputNumber
                suffix="px"
                value={vr.text.size}
                onChange={(e) =>
                  !isNil(e) &&
                  updateText({
                    size: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边颜色">
              <ColorPicker
                value={vr.text.borderColor}
                onChange={(e) =>
                  updateText({
                    borderColor: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="描边宽度">
              <InputNumber
                suffix="px"
                value={vr.text.borderSize}
                onChange={(e) =>
                  !isNil(e) &&
                  updateText({
                    borderSize: e,
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          建筑
          <Form.Item noStyle>
            <Switch
              value={vr.building.enable}
              onChange={(e) =>
                updateBuilding({
                  enable: e,
                })
              }
            />
          </Form.Item>
        </div>
        <Row>
          <Col span={12}>
            <Form.Item label="背景颜色">
              <ColorPicker
                value={vr.building.color}
                onChange={(e) =>
                  updateBuilding({
                    color: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边宽度">
              <InputNumber
                suffix="px"
                value={vr.building.borderSize}
                onChange={(e) =>
                  e &&
                  updateBuilding({
                    borderSize: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边颜色">
              <ColorPicker
                value={vr.building.borderColor}
                onChange={(e) =>
                  updateBuilding({
                    borderColor: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="点位形式">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          偏移设置
          <IconButton
            // icon={}
            onClick={() =>
              updateShift({
                gimbalYaw: 0,
                gimbalPitch: 0,
                height: 0,
                lng: 0,
                lat: 0,
              })
            }
          >
            <UndoOutlined />
          </IconButton>
        </div>
        <Row>
          <Col span={24}>
            <Form.Item label="云台偏航角" noStyle>
              <div className="flex items-center gap-2">
                <div className="w-[75px]">云台偏航角</div>
                <Slider
                  className="grow"
                  min={-45}
                  max={45}
                  step={0.1}
                  value={vr.shift.gimbalYaw}
                  onChange={(e) => updateShift({ gimbalYaw: e })}
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {vr.shift.gimbalYaw} °
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="云台偏航角" noStyle>
              <div className="flex items-center gap-2">
                <div className="w-[75px]">云台俯仰角</div>
                <Slider
                  className="grow"
                  min={-30}
                  max={30}
                  step={0.1}
                  value={vr.shift.gimbalPitch}
                  onChange={(e) => updateShift({ gimbalPitch: e })}
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {vr.shift.gimbalPitch} °
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="云台偏航角" noStyle>
              <div className="flex items-center gap-2">
                <div className="w-[75px]">无人机高度</div>
                <Slider
                  className="grow"
                  min={-120}
                  max={120}
                  step={0.1}
                  value={vr.shift.height}
                  onChange={(e) =>
                    updateShift({
                      height: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {vr.shift.height} m
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="云台偏航角" noStyle>
              <div className="flex items-center gap-2">
                <div className="w-[75px]">元素经度</div>
                <Slider
                  className="grow"
                  min={-100}
                  max={100}
                  value={vr.shift.lat}
                  onChange={(e) =>
                    updateShift({
                      lat: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {vr.shift.lat} m
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="云台偏航角" noStyle>
              <div className="flex items-center gap-2">
                <div className="w-[75px]">元素维度</div>
                <Slider
                  className="grow"
                  min={-100}
                  max={100}
                  value={vr.shift.lng}
                  onChange={(e) =>
                    updateShift({
                      lng: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {vr.shift.lng} m
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
})

VRSetting.displayName = 'VRSetting'

export default VRSetting
