import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { UAVWaylineEnum } from '@/constant/uav/wayline'
import { getWaylineTaskModel } from '@/service/modules/airline'
import { Form } from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { isNil } from 'lodash'

type PropsType = unknown

/** 创建航线模板 */
const AddAirlineTemplate: FC<PropsType> = memo(() => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { t, i18n } = useTranslation()

  const { data: modelsData } = useQuery(
    {
      queryKey: ['airlineModels'],
      queryFn: () => getWaylineTaskModel(),
      select: (d) => d.data,
    },
    queryClient,
  )

  const [modelOptions, cameraOptions] = useMemo<
    [DefaultOptionType[], DefaultOptionType[][]]
  >(() => {
    if (!modelsData) {
      return [[], []]
    }

    const modelOptions = modelsData.map((e, i) => ({
      label: e.modelName,
      value: i,
    }))

    const cameraOptions: DefaultOptionType[][] = []
    modelsData.forEach((model, i) => {
      cameraOptions[i] = model.cameras.map((camera, j) => ({
        label: camera.cameraName,
        value: j,
      }))
    })
    return [modelOptions, cameraOptions]
  }, [modelsData])

  const [form] = Form.useForm()
  const uavTypeIdx = Form.useWatch('uavType', form)

  const gimbalOptions = useMemo(
    () => cameraOptions[uavTypeIdx] ?? [],
    [uavTypeIdx],
  )

  const addItems = useMemo(() => {
    return [
      {
        name: 'airlineName',
        label: t('wayline.create.form.waylineName.label'),
        type: 'input',
        rules: [
          {
            required: true,
            message: t('wayline.create.form.waylineName.required_msg'),
          },
        ],
      },
      {
        name: 'type',
        label: t('wayline.create.form.waylineType.label'),
        type: 'select',
        options: [
          {
            label: t('wayline.create.form.waylineType.options.point.title'),
            value: 0,
          },
          {
            label: t('wayline.create.form.waylineType.options.area.title'),
            value: 1,
          },
        ],
      },
      {
        name: 'uavType',
        label: t('wayline.create.form.uavType.label'),
        type: 'select',
        options: modelOptions,
      },
      {
        name: 'gimbalType',
        label: t('wayline.create.form.gimbalType.label'),
        type: 'select',
        options: gimbalOptions,
      },
    ] as XFormItem[]
  }, [i18n.language, modelOptions, gimbalOptions])

  useEffect(() => {
    form.setFieldsValue({ gimbalType: undefined })
  }, [uavTypeIdx])

  useEffect(() => {
    form.resetFields()
  }, [open])

  const handleConfirm = (v) => {
    // 模型名称
    const modelName = isNil(v.uavType)
      ? ''
      : `&modelName=${modelsData![v.uavType].modelName}`
    // 相机参数
    const camera = isNil(v.gimbalType)
      ? ''
      : `&camera=${JSON.stringify(
          modelsData![v.uavType].cameras[v.gimbalType],
        )}`
    const to =
      v.type === UAVWaylineEnum.PointWayline ? 'edit' : 'area-wayline-edit'
    navigate(`/airline/${to}?name=${v.airlineName}${modelName}${camera}`)
  }

  return (
    <>
      <IconButton
        toolTipProps={{
          title: t('wayline.create.title'),
          mouseEnterDelay: 0.5,
        }}
        onClick={() => setOpen(true)}
      >
        <IconPlus />
      </IconButton>
      <FormModal
        form={form}
        title={t('wayline.create.title')}
        open={open}
        items={addItems}
        initialValues={{
          type: UAVWaylineEnum.PointWayline,
        }}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
})

AddAirlineTemplate.displayName = 'AddAirlineTemplate'

export default AddAirlineTemplate
