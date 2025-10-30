import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useMemoizedFn } from 'ahooks'
import { Form, Segmented } from 'antd'
import usePostDeviceService from '../../hooks/usePostDeviceService'
import SegmentTitle from '@/components/ui/SegmentTitle'
import IconButton from '@/components/ui/button/IconButton'
import XForm from '@/components/XForm'

type PropsType = unknown

type CalibrationMode = 'manual' | 'auto'

type FormValues = {
  longitude?: number
  latitude?: number
  altitude?: number
}

const parseToNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

const LocationCalibration: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const postService = usePostDeviceService()

  const [mode, setMode] = useState<CalibrationMode>('manual')
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm<FormValues>()

  const autoValues = useMemo(() => {
    const detailRecord = deviceDetail as Record<string, unknown> | null
    const longitude = parseToNumber(detailRecord?.['longitude'])
    const latitude = parseToNumber(detailRecord?.['latitude'])
    const altitude = parseToNumber(detailRecord?.['altitude'])

    return {
      longitude,
      latitude,
      altitude,
    }
  }, [deviceDetail])

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
      await postService('rtkCalibration', {
        longitude: values.longitude,
        latitude: values.latitude,
        altitude: values.altitude ?? 0,
        mode,
      })
      await queryClient.invalidateQueries({
        queryKey: ['deviceDetail', deviceId],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <SegmentTitle title={'位置标定'} />
        <IconButton disabled={disabled} onClick={handleSubmit}>
          <IconKCCheck />
        </IconButton>
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
            name: 'altitude',
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
