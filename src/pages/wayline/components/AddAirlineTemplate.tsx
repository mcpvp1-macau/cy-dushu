import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconRebotDogWayline from '@/assets/icons/jsx/IconRebotDogWayline'
import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import IconWaylineAirpoint from '@/assets/icons/jsx/IconWaylineAirpoint'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { editRoutePathMap, WaylineEnum } from '@/constant/uav/wayline'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getWaylineTaskModel } from '@/service/modules/airline'
import { getSpaceList } from '@/service/modules/layer_overlay'
import { Form } from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { isNil } from 'lodash'

type PropsType = unknown

/** 创建航线模板 */
const AddAirlineTemplate: FC<PropsType> = memo(() => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const msgApi = useAppMsg()

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

  // 点云 3D 数据 用于 3d点云 航线
  const { data: cloud3DData, isLoading: cloud3DDataLoading } = useQuery({
    queryKey: ['cloundPointModels'],
    queryFn: () => getSpaceList({ spaceType: 'POINT_CLOUD_3D', isPage: false }),
    select: (d) => d.data,
    enabled: type === WaylineEnum.PointCloud3DWayline,
  })

  const cloud3DOptions = useMemo(
    () =>
      cloud3DData?.rows?.map((e, i) => ({
        label: e.spaceName,
        value: i,
      })) ?? [],
    [cloud3DData],
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
          {
            label: (
              <div className="flex gap-2 items-center">
                <IconWaylineAirpoint />
                {t(
                  'wayline.create.form.waylineType.options.pointCloud3D.title',
                )}
              </div>
            ),
            value: WaylineEnum.PointCloud3DWayline,
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
      // 地图
      ...(type === WaylineEnum.PointCloud3DWayline
        ? ([
            {
              name: 'cloud3D',
              label: t('wayline.create.form.cloud3D.label'),
              type: 'select',
              options: cloud3DOptions,
              otherProps: {
                loading: cloud3DDataLoading,
                placeholder: cloud3DDataLoading
                  ? t('common.loading')
                  : t('common.form.pleaseSelect'),
              },
            },
          ] as XFormItem[])
        : []),
    ] as XFormItem[]
  }, [
    i18n.language,
    modelOptions,
    type,
    gimbalOptions,
    cloud3DDataLoading,
    cloud3DOptions,
  ])

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
    const to = editRoutePathMap.get(v.type) || 'edit'

    let pointCloud3DParams = ''
    if (v.type === WaylineEnum.PointCloud3DWayline) {
      const row = cloud3DData?.rows?.[v.cloud3D]
      if (!row) {
        msgApi.error('请选择点云地图')
        return
      }
      pointCloud3DParams = `&cloud3DSpaceId=${row.id}&could3DUrl=${row.spaceMapUrl}`
    }

    navigate(
      `/wayline/${to}?name=${v.airlineName}${modelName}${camera}${pointCloud3DParams}`,
    )
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
