import XModal from '@/components/XModal'
import { Form, InputNumber } from 'antd'
import { msgMitt } from '@/hooks/useAppMsg'
import { useAsyncEffect } from 'ahooks'
import {
  getDeviceDetail,
  setProperty,
  setWanglouConfig,
} from '@/service/modules/device'
import { objectToMapString, parseMapString } from '@/utils/other/utils'
import useRadarMap from '@/utils/map/useRadarMap'
import SegmentTitle from '@/components/ui/SegmentTitle'

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

  const save = async (values) => {
    const { code } = await setWanglouConfig(productKey, deviceId, values)
    if (code === 'SUCCESS') {
      msgMitt.emit('open', { type: 'success', content: '保存成功' })
      // 刷新地图设备
      queryClient.refetchQueries({
        queryKey: ['map-device-list'],
      })
      // refreshData?.();
    } else {
      msgMitt.emit('open', { type: 'error', content: '保存失败' })
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
        content: `入库成功`,
      })
    } else {
      msgMitt.emit('open', {
        type: 'error',
        content: `上传失败`,
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
      // if (radarData?.properties?.scanRangeJson === mapString) {
      //   // 未变化
      //   save(values)
      // } else {
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
            content: `雷达范围检测完成`,
          })
        },
        (pross) => {
          msgMitt.emit('open', {
            type: 'loading',
            key: 'radar-comp',
            content: `雷达范围检测中${(pross * 100).toFixed(3)}%`,
          })
        },
      )
      // }
    })
  }
  const onValuesChange = (_v, _values) => {}
  const formFields = [
    // {
    //   label: '基础信息配置',
    //   type: 'title',
    // },
    // {
    //   label: '经度',
    //   name: 'longitude',
    // },
    // {
    //   label: '纬度',
    //   name: 'latitude',
    // },
    // {
    //   label: '海拔高度',
    //   name: 'altitude',
    //   suffix: 'm',
    // },
    // {
    //   label: '红外离地高度',
    //   name: 'tiCameraGroundLift',
    //   suffix: 'm',
    // },
    // {
    //   label: '可见光离地高度',
    //   name: 'cameraGroundLift',
    //   suffix: 'm',
    // },
    // {
    //   label: '雷达离地高度',
    //   name: 'radarGroundLift',
    //   suffix: 'm',
    // },
    // {
    //   label: '转台离地高度',
    //   name: 'turnGroundLift',
    //   suffix: 'm',
    // },
    // {
    //   label: '转台俯仰角设置',
    //   name: 'turnHorizontalAngle',
    //   suffix: '°',
    // },
    // {
    //   label: '转台偏北角设置',
    //   name: 'turnNorthCorner',
    //   suffix: '°',
    // },
    // {
    //   label: '雷达偏北角设置',
    //   name: 'radarNorthCorner',
    //   suffix: '°',
    // },
    {
      label: '雷达范围设置',
      type: 'title',
      suffix: 'm',
    },
    {
      label: '经度',
      name: 'longitude',
    },
    {
      label: '纬度',
      name: 'latitude',
    },
    {
      label: '海拔高度',
      name: 'altitude',
      suffix: 'm',
    },
    {
      label: '雷达离地高度',
      name: 'radarGroundLift',
      suffix: 'm',
    },
    {
      label: '雷达检测半径',
      name: 'r',
      suffix: 'm',
    },
    {
      label: '海拔半径插值',
      name: 'rSum',
    },
    {
      label: '方向插值',
      name: 'angleSum',
    },
    {
      label: '威力图角度 1',
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
    // {
    //   label: '震动仪范围设置',
    //   type: 'title',
    //   suffix: '°',
    // },
    // {
    //   label: '经度',
    //   name: 'vibratorLongitude',
    // },
    // {
    //   label: '纬度',
    //   name: 'vibratorLatitude',
    // },
    // {
    //   label: '检测半径',
    //   name: 'detectionRadius',
    //   type: 'string',
    //   suffix: 'm',
    // },
    // {
    //   label: '海拔',
    //   name: 'vibratorAltitude',
    //   suffix: 'm',
    // },
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

    // 雷达
    let radarData: API_DEVICE.domain.Device['properties'] = {}
    if (res?.code === 'SUCCESS') {
      res.data.childDevice?.forEach((item) => {
        if (item.deviceType === 'RADAR') {
          radarData = item.properties
          setRadarData(item)
        }
      })
    }
    const radarScanRange = parseMapString(radarData?.scanRangeJson)

    form.setFieldsValue({
      altitude: radarData?.altitude || 0,
      latitude: radarData?.latitude,
      longitude: radarData?.longitude,
      radarGroundLift: radarData?.groundLift || 30,
      r: radarScanRange['r'] || 10000,
      rSum: radarScanRange['rSum'] || 1000,
      angleSum: radarScanRange['angleSum'] || 360,
      angle1: radarScanRange['angle1'] || 0,
    })
  }, [open])

  if (!open) return null

  return (
    <XModal
      open={open}
      title="设备配置"
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
                <SegmentTitle title={item.label} />
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
