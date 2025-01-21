import XModal from '@/components/XModal'
import { Form, InputNumber } from 'antd'
import { msgMitt } from '@/hooks/useAppMsg'
import Title from '@/components/Title'
import { useAsyncEffect } from 'ahooks'
import {
  getDeviceDetail,
  setProperty,
  setWanglouConfig,
} from '@/service/modules/device'
import { objectToMapString, parseMapString } from '@/utils/other/utils'
import useRadarMap from '@/utils/map/useRadarMap'

type PropsType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: API_DEVICE.domain.Device
}

// 其实就是设备配置
const InitParams: React.FC<PropsType> = ({ open, setOpen, data }) => {
  const { deviceId, deviceModel } = data
  const { productKey } = deviceModel!
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const [radarData, setRadarData] = useState<any>()
  const { t } = useTranslation()

  const save = async (values) => {
    const { code } = await setWanglouConfig(productKey, deviceId, values)
    if (code === 'SUCCESS') {
      msgMitt.emit('open', {
        type: 'success',
        content: t('message.success.save'),
      })
      // 刷新地图设备
      queryClient.refetchQueries({
        queryKey: ['map-device-list'],
      })
      // refreshData?.();
    } else {
      msgMitt.emit('open', { type: 'error', content: t('message.error.save') })
    }
    setLoading(false)
    setOpen(false)
  }

  const setRadarRangeProfile = async (data, values, mapString) => {
    const res = await setProperty(
      radarData?.deviceModel?.productKey,
      radarData?.deviceModel?.deviceId,
      {
        property: 'scanRangeProfile',
        data,
      },
    )
    const { code } = res
    if (code === 'SUCCESS') {
      msgMitt.emit('open', {
        type: 'success',
        content: t('message.success.savefile'),
      })
    } else {
      msgMitt.emit('open', {
        type: 'error',
        content: t('message.error.savefile'),
      })
    }
    await save({
      ...values,
      scanRangeJson: mapString,
      scanRangeProfile: res.data.value,
    })
    setLoading(false)
  }

  const onOk = () => {
    form.validateFields().then((values) => {
      const {
        r,
        rSum,
        angleSum,
        angle1,
        longitude,
        latitude,
        altitude,
        radarGroundLift,
      } = values
      const radarFormObject = {
        r,
        rSum,
        angleSum,
        angle1,
      }
      delete values.r
      delete values.rSum
      delete values.angleSum
      delete values.angle1
      delete values.angle2
      delete values.angle3

      const mapString = objectToMapString(radarFormObject)
      const height = +altitude + +radarGroundLift
      setLoading(true)
      // 判断雷达范围配置是否变化
      if (radarData?.properties?.scanRangeJson === mapString) {
        // 未变化
        save(values)
      } else {
        // 已变化
        useRadarMap.start(
          {
            r,
            rSum,
            angleSum,
            angle: angle1,
            longitude,
            latitude,
            altitude: height,
          },
          (data) => {
            setRadarRangeProfile(data, values, mapString)
            msgMitt.emit('open', {
              type: 'success',
              key: 'radar-comp',
              content: t('device.radar.range.success'),
            })
          },
          (pross) => {
            msgMitt.emit('open', {
              type: 'loading',
              key: 'radar-comp',
              content: `${t('device.radar.range.loading')}${(pross * 100).toFixed(3)}%`,
            })
          },
        )
      }
    })
  }
  const onValuesChange = (v, values) => {}
  const formFields = [
    {
      label: t('device.setting.base'),
      type: 'title',
    },
    {
      label: t('common.longitude'),
      name: 'longitude',
    },
    {
      label: t('common.latitude'),
      name: 'latitude',
    },
    {
      label: t('common.altitude'),
      name: 'altitude',
      suffix: 'm',
    },
    {
      label: t('common.tiCameraGroundLift'),
      name: 'tiCameraGroundLift',
      suffix: 'm',
    },
    {
      label: t('common.cameraGroundLift'),
      name: 'cameraGroundLift',
      suffix: 'm',
    },
    {
      label: t('common.radarGroundLift'),
      name: 'radarGroundLift',
      suffix: 'm',
    },
    {
      label: t('common.turnGroundLift'),
      name: 'turnGroundLift',
      suffix: 'm',
    },
    {
      label: t('common.turnHorizontalAngle'),
      name: 'turnHorizontalAngle',
      suffix: '°',
    },
    {
      label: t('common.turnNorthCorner'),
      name: 'turnNorthCorner',
      suffix: '°',
    },
    {
      label: t('common.radar.northCorner'),
      name: 'radarNorthCorner',
      suffix: '°',
    },
    {
      label: t('device.setting.radraRange'),
      type: 'title',
      suffix: 'm',
    },
    {
      label: t('common.radar.radius'),
      name: 'r',
      suffix: 'm',
    },
    {
      label: t('common.radar.rSum'),
      name: 'rSum',
    },
    {
      label: t('common.radar.angleSum'),
      name: 'angleSum',
    },
    {
      label: t('common.radar.angle1'),
      name: 'angle1',
      suffix: '°',
    },
    // {
    //   label: '威力图角度 2',
    //   name: 'angle2',
    //   suffix: '°',
    // },
    // {
    //   label: '威力图角度 3',
    //   name: 'angle3',
    //   suffix: '°',
    // },
    {
      label: t('device.setting.vibrator.range'),
      type: 'title',
      suffix: '°',
    },
    {
      label: t('common.longitude'),
      name: 'vibratorLongitude',
    },
    {
      label: t('common.latitude'),
      name: 'vibratorLatitude',
    },
    {
      label: t('common.detectionRadius'),
      name: 'detectionRadius',
      type: 'string',
      suffix: 'm',
    },
    {
      label: t('common.altitude'),
      name: 'vibratorAltitude',
      suffix: 'm',
    },
  ]
  const queryClient = useQueryClient()

  useAsyncEffect(async () => {
    if (!open) return
    // 每次打开获取详情
    await queryClient.refetchQueries({
      queryKey: ['deviceDetail', deviceId],
    })
    const res = queryClient.getQueryData<
      Awaited<ReturnType<typeof getDeviceDetail>>
    >(['deviceDetail', deviceId])

    // 红外
    let infraredData: API_DEVICE.domain.Device['properties'] = {}
    // 可见光
    let visibleData: API_DEVICE.domain.Device['properties'] = {}
    // 雷达
    let radarData: API_DEVICE.domain.Device['properties'] = {}
    const radarScanRange = parseMapString(radarData?.properties?.scanRangeJson)
    // 转台
    let turntableData: API_DEVICE.domain.Device['properties'] = {}
    // 震动仪
    let vibratorData: API_DEVICE.domain.Device['properties'] = {}
    if (res?.code === 'SUCCESS') {
      res.data.childDevice?.forEach((item) => {
        if (item.deviceType === 'INFRARED_CAMERA') {
          infraredData = item.properties
        } else if (item.deviceType === 'VISIBLE_LIGHT_CAMERA') {
          visibleData = item.properties
        } else if (item.deviceType === 'VIBRATOR') {
          vibratorData = item.properties
        } else if (item.deviceType === 'RADAR') {
          radarData = item.properties
          setRadarData(item)
        }
      })
      turntableData = res.data.properties
    }
    form.setFieldsValue({
      altitude: turntableData?.altitude,
      latitude: turntableData?.latitude,
      longitude: turntableData?.longitude,
      cameraGroundLift: visibleData?.groundLift,
      radarGroundLift: radarData?.groundLift,
      radarNorthCorner: radarData?.northCorner,
      tiCameraGroundLift: infraredData?.groundLift,
      turnHorizontalAngle: turntableData?.horizontalAngle,
      turnNorthCorner: turntableData?.northCorner,
      turnGroundLift: turntableData?.groundLift,
      r: radarScanRange['r'] || 10000,
      rSum: radarScanRange['rSum'] || 1000,
      angleSum: radarScanRange['angleSum'] || 360,
      angle1: radarScanRange['angle1'] || 0,
      // angle2: radarScanRange.get('angle2') || 30,
      // angle3: radarScanRange.get('angle3') || -30,
      vibratorLongitude: vibratorData?.longitude || 0,
      vibratorLatitude: vibratorData?.latitude || 0,
      detectionRadius: vibratorData?.detectionRadius || '0',
      vibratorAltitude: vibratorData?.altitude || 0,
    })
  }, [open])

  if (!open) return null

  return (
    <XModal
      open={open}
      title={t('device.setting.wanglou')}
      onCancel={() => setOpen(false)}
      onClose={() => setOpen(false)}
      onConfirm={onOk}
      width={800}
      // loading={loading}
      confirmLoading={loading}
    >
      <Form
        form={form}
        onValuesChange={onValuesChange}
        labelWrap
        labelCol={{ span: 10 }}
        className="flex flex-wrap gap-2 gap-x-10"
      >
        {formFields.map((item) => {
          if (item.type === 'title') {
            return (
              <Form.Item
                key={item.name}
                style={{ width: '100%', marginTop: 10 }}
              >
                <Title bar level={5}>
                  {item.label}
                </Title>
              </Form.Item>
            )
          } else {
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                rules={[{ required: true }]}
                className="w-[46%]"
              >
                <InputNumber suffix={item.suffix || ''} className="w-[100%]" />
              </Form.Item>
            )
          }
        })}
      </Form>
    </XModal>
  )
}

export default InitParams
