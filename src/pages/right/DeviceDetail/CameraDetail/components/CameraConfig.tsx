import IconButton from '@/components/ui/button/IconButton'
import XForm from '@/components/XForm'
import useCameraSettingStore from '@/store/setting/useCameraSetting.store'
import { RedoOutlined } from '@ant-design/icons'
import { Form } from 'antd'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import SegmentTitle from '@/components/ui/SegmentTitle'
import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import * as Cesium from 'cesium'

type PropsType = unknown

const CameraConfig: FC<PropsType> = memo(() => {
  const [form] = Form.useForm()

  const detail = useDeviceDetailStore((s) => s.deviceDetail)
  const updateDeviceCameraConfig = useCameraSettingStore(
    (s) => s.updateDeviceCameraConfig,
  )
  const cameraConfig = useCameraSettingStore(
    (s) =>
      s.deviceCameraConfig[detail?.deviceId || ''] ?? {
        aspectRatio: 1.7777,
        far: 50,
        roll: 0,
        heading: 0,
        pitch: 45,
        fov: 45,
      },
  )

  return (
    <div className="m-3 flex flex-col">
      <div className="mb-2 flex justify-between">
        <SegmentTitle title="投影配置" />
        <IconButton
          toolTipProps={{ title: '地图定位' }}
          disabled={
            !detail ||
            [
              'lng',
              'lat',
              'height',
              'heading',
              'pitch',
              'roll',
              'fov',
              'far',
              'aspectRatio',
            ].some((key) => typeof cameraConfig[key] !== 'number')
          }
          onClick={() => {
            bigFlyEmitter.emit('flyTo', {
              destination: Cesium.Cartesian3.fromDegrees(
                cameraConfig.lng,
                cameraConfig.lat,
                cameraConfig.height,
              ),
              orientation: {
                heading:
                  Cesium.Math.toRadians(cameraConfig.heading || 0) || undefined,
                pitch:
                  Cesium.Math.toRadians(-(90 - cameraConfig.pitch) || 0) ||
                  undefined,
                roll: Cesium.Math.toRadians(cameraConfig.roll) || undefined,
              },
              duration: 1.2,
            })
          }}
        >
          <IconToLocation />
        </IconButton>
      </div>
      <XForm
        form={form}
        colon={false}
        initialValues={{ ...cameraConfig }}
        items={[
          {
            label: '经度',
            name: 'lng',
            type: 'input-number',
            otherProps: {
              addonAfter: (
                <div className="px-1">
                  <IconButton
                    onClick={() => {
                      form.setFieldValue('lng', detail?.properties?.longitude)
                    }}
                  >
                    <RedoOutlined />
                  </IconButton>
                </div>
              ),
            },
          },
          {
            label: '纬度',
            name: 'lat',
            type: 'input-number',
            otherProps: {
              addonAfter: (
                <div className="px-1">
                  <IconButton
                    onClick={() => {
                      form.setFieldValue('lat', detail?.properties?.latitude)
                    }}
                  >
                    <RedoOutlined />
                  </IconButton>
                </div>
              ),
            },
          },
          {
            label: '高度',
            name: 'height',
            type: 'input-number',
          },
          {
            label: '航向角',
            name: 'heading',
            type: 'slider',
            otherProps: {
              min: -180,
              max: 180,
            },
          },
          {
            label: '俯仰角',
            name: 'pitch',
            type: 'slider',
            otherProps: {
              min: 0,
              max: 180,
            },
          },
          {
            label: '横滚角',
            name: 'roll',
            type: 'slider',
            otherProps: {
              min: -180,
              max: 180,
            },
          },
          {
            label: '视场角',
            name: 'fov',
            type: 'slider',
            otherProps: {
              min: 1,
              max: 179,
            },
          },
          {
            label: '投射距离',
            name: 'far',
            type: 'slider',
            otherProps: {
              min: 1,
              max: 1000,
            },
          },
          {
            label: '宽高比',
            name: 'aspectRatio',
            type: 'input-number',
          },
        ]}
        onValuesChange={() => {
          updateDeviceCameraConfig(detail!.deviceId, {
            ...form.getFieldsValue(),
          })
        }}
      />
    </div>
  )
})

CameraConfig.displayName = 'CameraConfig'

export default CameraConfig
