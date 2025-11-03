import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useMemoizedFn } from 'ahooks'
import { Form, Segmented } from 'antd'
import usePostDeviceService from '../../hooks/usePostDeviceService'
import SegmentTitle from '@/components/ui/SegmentTitle'
import XForm from '@/components/XForm'
import { useAppMsg } from '@/hooks/useAppMsg'
import TextButton from '@/components/ui/button/TextButton'

type PropsType = {
  state: Record<string, any>
}

type CalibrationMode = 'manual' | 'auto'

type FormValues = {
  longitude?: number
  latitude?: number
  height?: number
}

const parseToNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

const LocationCalibration: FC<PropsType> = memo((props) => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const postService = usePostDeviceService()

  const msgApi = useAppMsg()

  const [mode, setMode] = useState<CalibrationMode>('manual')
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm<FormValues>()

  const autoValues = useMemo(() => {
    const detailRecord = props.state as Record<string, unknown> | null
    const longitude = parseToNumber(detailRecord?.['longitude'])
    const latitude = parseToNumber(detailRecord?.['latitude'])
    const height = parseToNumber(detailRecord?.['height'])

    return {
      longitude,
      latitude,
      height,
    }
  }, [props.state])

  useEffect(() => {
    if (mode === 'auto') {
      form.setFieldsValue(autoValues)
      return
    }
  }, [autoValues, form, mode])

  const handleModeChange = useMemoizedFn((value: CalibrationMode) => {
    setMode(value)
    if (value === 'auto') {
      form.setFieldsValue(autoValues)
      return
    }
  })

  const disabled = loading

  const queryClient = useQueryClient()
  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (!productKey || !deviceId) {
      return
    }
    setLoading(true)
    try {
      await postService(
        'rtkCalibration',
        {
          longitude: values.longitude,
          latitude: values.latitude,
          height: values.height ?? 0,
          mode,
        },
        '',
        false,
      )
      await queryClient.invalidateQueries({
        queryKey: ['deviceDetail', deviceId],
      })
      msgApi.success('位置标定成功')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <SegmentTitle title={'位置标定'} />
        <TextButton disabled={disabled} onClick={handleSubmit}>
          <IconKCCheck /> 提交
        </TextButton>
      </div>
      <div className="mt-2">
        <Segmented<CalibrationMode>
          value={mode}
          block
          options={[
            { label: '自动', value: 'auto' },
            { label: '手动', value: 'manual' },
          ]}
          onChange={(value) => handleModeChange(value)}
        />
      </div>
      <XForm
        layout="vertical"
        rowsProps={{ gutter: 8 }}
        form={form}
        disabled={disabled || mode === 'auto'}
        items={[
          {
            label: '经度',
            name: 'longitude',
            type: 'input-number',
            colsProps: { span: 12 },
            rules: [{ required: true, message: '请输入经度' }],
          },
          {
            label: '纬度',
            name: 'latitude',
            type: 'input-number',
            colsProps: { span: 12 },
            rules: [{ required: true, message: '请输入纬度' }],
          },
          {
            label: '高度',
            name: 'height',
            type: 'input-number',
            colsProps: { span: 24 },
          },
        ]}
      />
    </div>
  )
})

LocationCalibration.displayName = 'LocationCalibration'

export default LocationCalibration
