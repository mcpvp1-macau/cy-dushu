import { Col, Form, Row } from 'antd'
import ControlItemSelect from '../../ControlItem'

type Props = unknown

const CameraControl: FC<Props> = () => {
  const [form] = Form.useForm()

  return (
    <div className="pt-[10px]">
      <Form
        name="z30pro2"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        form={form}
      >
        <Row gutter={10}>
          {/* <Col span={12}>
            <ControlItemSelect
              serviceName="cameraAperture"
              label="光圈调节"
              valueName=""
            />
          </Col> */}
          <Col span={12}>
            <ControlItemSelect
              serviceName="colorGain"
              label="色彩增益"
              valueName="cameraColorGain"
            />
          </Col>
          {/* <Col span={12}>
            <ControlItemSelect
              serviceName=""
              label="可见度增强"
              valueName="cameraVeEnable"
              type="switch"
            />
          </Col> */}
          <Col span={12}>
            <ControlItemSelect
              serviceName="stabilizeMode"
              label="电子增稳"
              valueName="cameraStabilizeMode"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="noiseReduction"
              label="降噪"
              valueName="cameraNoiseEnable"
              type="switch"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="darkModeControl"
              label="夜间模式"
              valueName="cameraDarkMode"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="cameraWd"
              label="宽动态"
              valueName="cameraWdEnable"
              type="switch"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="whiteBalanceModeControl"
              label="白平衡"
              valueName="cameraWhiteBalance"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="cameraDZoomEnable"
              label="电子变倍"
              valueName="cameraDzoomEnable"
              type="switch"
            />
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="fogThroughEnable"
              label="透雾"
              valueName="cameraFogThrough"
            />
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default memo(CameraControl)
