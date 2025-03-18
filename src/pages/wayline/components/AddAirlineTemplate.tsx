import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconRebotDogWayline from '@/assets/icons/jsx/IconRebotDogWayline'
import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import IconWaylineAirpoint from '@/assets/icons/jsx/IconWaylineAirpoint'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { WaylineEnum } from '@/constant/uav/wayline'
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
  const type = Form.useWatch('type', form)

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
            label: (
              <div className="flex gap-2 items-center">
                <IconWaylineAirpoint />
                {t('wayline.create.form.waylineType.options.point.title')}
              </div>
            ),
            value: WaylineEnum.PointWayline,
          },
          {
            label: (
              <div className="flex gap-2 items-center">
                <MenuIconAirline />
                {t('wayline.create.form.waylineType.options.area.title')}
              </div>
            ),
            value: WaylineEnum.AreaWayline,
          },
          {
            label: (
              <div className="flex gap-2 items-center">
                <IconSwarm />
                {t('wayline.create.form.waylineType.options.swarm.title')}
              </div>
            ),
            value: WaylineEnum.SwarmWayline,
          },
          {
            label: (
              <div className="flex gap-2 items-center">
                <IconRebotDogWayline />
                {t('wayline.create.form.waylineType.options.rebotDog.title')}
              </div>
            ),
            value: WaylineEnum.RebotDogWayline,
          },
        ],
      },
      // 「航点航线」和「面状航线」需要选择无人机和相机
      ...([WaylineEnum.PointWayline, WaylineEnum.AreaWayline].includes(type)
        ? [
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
          ]
        : []),
    ] as XFormItem[]
  }, [i18n.language, modelOptions, type, gimbalOptions])

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
    // 根据航线类型选择不同的编辑页面
    const to =
      v.type === WaylineEnum.PointWayline
        ? 'edit'
        : v.type === WaylineEnum.AreaWayline
        ? 'area-wayline-edit'
        : v.type === WaylineEnum.SwarmWayline
        ? 'swarm-wayline-edit'
        : 'rebot-dog-wayline-edit'
    navigate(`/wayline/${to}?name=${v.airlineName}${modelName}${camera}`)
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
          type: WaylineEnum.PointWayline,
        }}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
})

AddAirlineTemplate.displayName = 'AddAirlineTemplate'

export default AddAirlineTemplate
