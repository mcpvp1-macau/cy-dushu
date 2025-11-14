import XForm from '@/components/XForm'
import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'
import { useForm } from 'antd/es/form/Form'

const ControlRoomUGVSpeedParams: FC = memo(() => {
  const [form] = useForm()
  const params = useUGVControlRoomStore((s) => s.params)
  const updateParams = useUGVControlRoomStore((s) => s.updateParams)

  useEffect(() => {
    form.setFieldsValue(params)
  }, [params])

  return (
    <div className="rounded-2xl border border-ground-3 bg-ground-1 p-4 shadow-inner">
      <div className="mb-3">
        <p className="text-sm font-semibold leading-tight text-ground-12">
          速度参数
        </p>
        <p className="text-[11px] text-ground-9">
          W/S 控制前后（xSpeed ±），Q/E 控制转向（yawSpeed ±）
        </p>
      </div>
      <XForm
        form={form}
        layout="vertical"
        size="small"
        colon={false}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, values) => {
          updateParams(values)
        }}
        items={[
          {
            label: '线速度 (m/s)',
            name: 'xSpeed',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 4,
              step: 0.1,
            },
          },
          {
            label: '角速度 (rad/s)',
            name: 'yawSpeed',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 1,
              step: 0.05,
            },
          },
        ]}
      />
    </div>
  )
})

ControlRoomUGVSpeedParams.displayName = 'ControlRoomUGVSpeedParams'

export default ControlRoomUGVSpeedParams
