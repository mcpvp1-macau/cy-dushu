import XModal from '@/components/XModal'
import { Form, InputNumber } from 'antd'
import { useEffect } from 'react'
import useRadarMap from '@/utils/map/useRadarMap'
import { msgMitt } from '@/hooks/useAppMsg'
import { setProperty, setWanglouConfig } from '@/service/modules/device'
import { objectToMapString } from '@/utils/other/utils'

type PropsType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  radarScanRange: Record<string, any>
  productKey: string
  deviceId: string
  longitude?: number
  latitude?: number
  altitude?: number
}

const RadarFormModal: React.FC<PropsType> = ({
  open,
  setOpen,
  radarScanRange,
  productKey,
  deviceId,
  longitude = 120,
  latitude = 30,
  altitude = 100,
}) => {
  const [form] = Form.useForm()
  const r = radarScanRange['r'] || 1000
  const rSum = radarScanRange['rSum'] || 1000
  const angleSum = radarScanRange['angleSum'] || 360
  const angle1 = radarScanRange['angle1'] || 0

  const { t } = useTranslation()

  const queryClient = useQueryClient()

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
    // setLoading(false)
    setOpen(false)
  }

  const setRadarRangeProfile = async (data, values, mapString) => {
    const res = await setProperty(productKey, deviceId, {
      property: 'scanRangeProfile',
      data,
    })
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
    // setLoading(false)
  }

  const start = async (values) => {
    const radarFormObject = {
      r,
      rSum,
      angleSum,
      angle1,
    }

    const mapString = objectToMapString(radarFormObject)

    useRadarMap.start(
      {
        r: values.r,
        rSum: values.rSum,
        angleSum: values.angleSum,
        angle: values.angle1,
        longitude,
        latitude,
        altitude,
      },
      (data) => {
        setRadarRangeProfile(data, {}, mapString)
        console.log(data)
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
          content: `${t('device.radar.range.loading')}${(pross * 100).toFixed(
            3,
          )}%`,
        })
      },
    )
  }

  const onConfirm = async () => {
    const values = await form.validateFields()
    if (
      values.r !== radarScanRange['r'] ||
      values.rSum !== radarScanRange['rSum'] ||
      values.angleSum !== radarScanRange['angleSum'] ||
      values.angle1 !== radarScanRange['angle1']
    ) {
      console.log(values)
      start(values)
    } else {
      // 未变化
      setOpen(false)
    }
  }
  useEffect(() => {
    form.setFieldsValue({
      r,
      rSum,
      angleSum,
      angle1,
    })
  }, [radarScanRange])
  return (
    <XModal
      open={open}
      title="设备配置"
      onCancel={() => setOpen(false)}
      onClose={() => setOpen(false)}
      onConfirm={onConfirm}
      width={300}
      // loading={loading}
      //   confirmLoading={loading}
    >
      <div>
        <Form
          form={form}
          labelCol={{ span: 10 }}
          layout="vertical"
          className="[&_.ant-input-number-group-addon]:!px-2"
        >
          <Form.Item label="雷达检查半径" name="r" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} addonAfter="m" />
          </Form.Item>

          <Form.Item
            label="检查半径插值"
            name="rSum"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} addonAfter="m" />
          </Form.Item>

          <Form.Item
            label="方向插值"
            name="angleSum"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="威力图角度"
            name="angle1"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </div>
    </XModal>
  )
}

export default RadarFormModal
