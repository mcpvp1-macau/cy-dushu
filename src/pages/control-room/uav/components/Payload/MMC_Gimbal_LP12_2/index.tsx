import { Col, Form, Row } from 'antd'
import ControlItem from '../ControlItem'

const MMC_Gimbal_LP12_2: React.FC = () => {
  const [form] = Form.useForm()
  return (
    <>
      <div className="pl-[12px] pr-[12px] pt-[12px]">
        <Form
          name="xxx"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          form={form}
        >
          <Row gutter={10}>
            <Col span={12}>
              <ControlItem
                serviceName="searchLightValueSet"
                label="灯光"
                valueName="lightStatus"
                // type="switch"
              />
            </Col>
            <Col span={12}>
              <ControlItem
                serviceName="searchLightValueSet"
                label="跟随"
                valueName="lightFollow"
                paramName="follow"
                type="switch"
              />
            </Col>
            <Col span={24}>
              <ControlItem
                serviceName="searchLightValueSet"
                label="亮度"
                valueName="lightStrength"
                paramName="lightStrength"
                type="slider"
              />
            </Col>
          </Row>
        </Form>
      </div>
    </>
  )
}

export default MMC_Gimbal_LP12_2
