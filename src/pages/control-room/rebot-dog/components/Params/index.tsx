import XForm from '@/components/XForm'
import { useForm } from 'antd/es/form/Form'

const RebotDogParams = memo(() => {
  const [form] = useForm()

  return (
    <div className="p-3">
      <XForm
        className="w-full"
        layout="horizontal"
        size="small"
        colon={false}
        form={form}
        items={[
          {
            label: '移动速度',
            name: 'speed',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 3.8,
              step: 0.1,
            },
          },
          {
            label: '姿态弧度',
            name: 'attitude',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 0.6,
              step: 0.1,
            },
          },
        ]}
        initialValues={{
          name: 'test',
        }}
      />
    </div>
  )
})

RebotDogParams.displayName = 'RebotDogParams'

export default RebotDogParams
