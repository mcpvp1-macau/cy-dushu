import Select from '@/components/AntdOverride/Select'
import IconButton from '@/components/ui/button/IconButton'
import useARSettingStore from '@/store/setting/useARSetting.store'
import { UndoOutlined } from '@ant-design/icons'
import { Col, ColorPicker, Form, InputNumber, Row, Slider, Switch } from 'antd'
import { isNil } from 'lodash'

type PropsType = unknown

const bigTypes = [
  'GovernmentAndSocialOrganizations', // 政府机构及社会团体
  'RoadFacilities', // 道路附属设施
  'CateringService', // 餐饮服务
  'TransportationFacilities', // 交通设施服务
  'MedicalCareService', // 医疗保健服务
  'ShoppingService', // 购物服务
  'SportsAndLeisure', // 体育休闲服务
  'CompaniesAndEnterprises', // 公司企业
  'ScenicSpot', // ⻛景名胜
  'MotorcycleService', // 摩托⻋服务
  'CarService', // 汽⻋服务
  'CarSales', // 汽⻋销售
  'CarMaintenance', // 汽⻋维修
  'FinancialAndInsuranceService', // 金融保险服务
  'BusinessAndResidential', // 商务住宅
  'ScienceEducationAndCulture', // 科教文化服务
  'PublicFacilities', // 公共设施
  'LifeService', // 生活服务
]

const bigTypeMapping = {
  en: {
    GovernmentAndSocialOrganizations: 'GovernmentAndSocialOrganizations',
    RoadFacilities: 'RoadFacilities',
    CateringService: 'CateringService',
    TransportationFacilities: 'TransportationFacilities',
    MedicalCareService: 'MedicalCareService',
    ShoppingService: 'ShoppingService',
    SportsAndLeisure: 'SportsAndLeisure',
    CompaniesAndEnterprises: 'CompaniesAndEnterprises',
    ScenicSpot: 'ScenicSpot',
    MotorcycleService: 'MotorcycleService',
    CarService: 'CarService',
    CarSales: 'CarSales',
    CarMaintenance: 'CarMaintenance',
    FinancialAndInsuranceService: 'FinancialAndInsuranceService',
    BusinessAndResidential: 'BusinessAndResidential',
    ScienceEducationAndCulture: 'ScienceEducationAndCulture',
    PublicFacilities: 'PublicFacilities',
    LifeService: 'LifeService',
  },
  zh: {
    GovernmentAndSocialOrganizations: '政府机构及社会团体',
    RoadFacilities: '道路附属设施',
    CateringService: '餐饮服务',
    TransportationFacilities: '交通设施服务',
    MedicalCareService: '医疗保健服务',
    ShoppingService: '购物服务',
    SportsAndLeisure: '体育休闲服务',
    CompaniesAndEnterprises: '公司企业',
    ScenicSpot: '⻛景名胜',
    MotorcycleService: '摩托⻋服务',
    CarService: '汽⻋服务',
    CarSales: '汽⻋销售',
    CarMaintenance: '汽⻋维修',
    FinancialAndInsuranceService: '金融保险服务',
    BusinessAndResidential: '商务住宅',
    ScienceEducationAndCulture: '科教文化服务',
    PublicFacilities: '公共设施',
    LifeService: '生活服务',
  },
}

/** 虚实融合相关设置 */
const ARSetting: FC<PropsType> = memo(() => {
  const ar = useARSettingStore((s) => s)
  const updAR = useARSettingStore((s) => s.updateAR)

  const { i18n } = useTranslation()
  const filterOptions = useMemo(() => {
    return bigTypes.map((type) => ({
      label: bigTypeMapping[i18n.language][type],
      value: type,
    }))
  }, [i18n.language])

  const updateMainRoad = (data: Partial<(typeof ar)['mainRoad']>) => {
    updAR({
      ...ar,
      mainRoad: {
        ...ar.mainRoad,
        ...data,
      },
    })
  }

  const updateSubRoad = (data: Partial<(typeof ar)['subRoad']>) => {
    updAR({
      ...ar,
      subRoad: {
        ...ar.subRoad,
        ...data,
      },
    })
  }

  const updateText = (data: Partial<(typeof ar)['text']>) => {
    updAR({
      ...ar,
      text: {
        ...ar.text,
        ...data,
      },
    })
  }

  const updateaoi = (data: Partial<(typeof ar)['aoi']>) => {
    updAR({
      ...ar,
      aoi: {
        ...ar.aoi,
        ...data,
      },
    })
  }

  const updatePoi = (data: Partial<(typeof ar)['poi']>) => {
    updAR({
      ...ar,
      poi: {
        ...ar.poi,
        ...data,
      },
    })
  }

  const updateOverlay = (data: Partial<(typeof ar)['overlay']>) => {
    updAR({
      ...ar,
      overlay: {
        ...ar.overlay,
        ...data,
      },
    })
  }

  const updateShift = (data: Partial<(typeof ar)['shift']>) => {
    updAR({
      ...ar,
      shift: {
        ...ar.shift,
        ...data,
      },
    })
  }

  const updateWayline = (data: Partial<(typeof ar)['wayline']>) => {
    updAR({
      ...ar,
      wayline: {
        ...ar.wayline,
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
              value={ar.mainRoad.enable}
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
                value={ar.mainRoad.color}
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
                value={ar.mainRoad.size}
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
                value={ar.mainRoad.borderColor}
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
                value={ar.mainRoad.borderSize}
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
              value={ar.subRoad.enable}
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
                value={ar.subRoad.color}
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
                value={ar.subRoad.size}
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
                value={ar.subRoad.borderColor}
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
                value={ar.subRoad.borderSize}
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
              value={ar.text.enable}
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
                value={ar.text.color}
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
                value={ar.text.size}
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
                value={ar.text.borderColor}
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
                value={ar.text.borderSize}
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
          区域
          <Form.Item noStyle>
            <Switch
              value={ar.aoi.enable}
              onChange={(e) =>
                updateaoi({
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
                value={ar.aoi.color}
                onChange={(e) =>
                  updateaoi({
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
                value={ar.aoi.borderSize}
                onChange={(e) =>
                  e &&
                  updateaoi({
                    borderSize: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="描边颜色">
              <ColorPicker
                value={ar.aoi.borderColor}
                onChange={(e) =>
                  updateaoi({
                    borderColor: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="展示建筑">
              <Switch
                value={ar.aoi.showBuilding}
                onChange={(e) => {
                  if (!isNil(e)) {
                    updateaoi({
                      showBuilding: e,
                    })
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          航线
          <Form.Item noStyle>
            <Switch
              value={ar.wayline.enable}
              onChange={(e) => updateWayline({ enable: e })}
            />
          </Form.Item>
        </div>

        <Row>
          <Col span={12}>
            <Form.Item label="航线颜色">
              <ColorPicker
                value={ar.wayline.color}
                onChange={(e) =>
                  updateWayline({
                    color: e.toHexString(),
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          点位
          <Form.Item noStyle>
            <Switch
              value={ar.poi.enable}
              onChange={(e) => updatePoi({ enable: e })}
            />
          </Form.Item>
        </div>

        <Row>
          <Col span={24}>
            <Form.Item label="过滤条件">
              <Select
                options={filterOptions}
                mode="multiple"
                value={ar.poi.filter}
                onChange={(e) => {
                  updatePoi({ filter: e })
                }}
                placeholder="ALL"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="展示名称">
              <Switch
                value={ar.poi.showName}
                onChange={(e) => updatePoi({ showName: e })}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-1.5 items-center mb-1">
          <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
          标绘
          <Form.Item noStyle>
            <Switch
              value={ar.overlay.enable}
              onChange={(e) =>
                updateOverlay({
                  enable: e,
                })
              }
            />
          </Form.Item>
        </div>
        <Row>
          <Col span={12}>
            <Form.Item label="点位">
              <Switch
                value={ar.overlay.point}
                onChange={(e) =>
                  updateOverlay({
                    point: e,
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="区域">
              <Switch
                value={ar.overlay.area}
                onChange={(e) =>
                  updateOverlay({
                    area: e,
                  })
                }
              />
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
                  value={ar.shift.gimbalYaw}
                  onChange={(e) => updateShift({ gimbalYaw: e })}
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {ar.shift.gimbalYaw} °
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
                  value={ar.shift.gimbalPitch}
                  onChange={(e) => updateShift({ gimbalPitch: e })}
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {ar.shift.gimbalPitch} °
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
                  value={ar.shift.height}
                  onChange={(e) =>
                    updateShift({
                      height: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {ar.shift.height} m
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
                  value={ar.shift.lat}
                  onChange={(e) =>
                    updateShift({
                      lat: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {ar.shift.lat} m
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
                  value={ar.shift.lng}
                  onChange={(e) =>
                    updateShift({
                      lng: e,
                    })
                  }
                />
                <div className="w-11 text-right whitespace-nowrap">
                  {ar.shift.lng} m
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
})

ARSetting.displayName = 'VRSetting'

export default ARSetting
