import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { editRoutePathMap, WaylineEnum } from '@/constant/uav/wayline'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getWaylineTaskModel } from '@/service/modules/wayline'
import { getSpaceList } from '@/service/modules/layer_overlay'
import { Form } from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { isNil } from 'lodash'
import { useSearchParams } from 'react-router-dom'
import { createWaylineTypeOptions } from './WaylineTemplateList'

type PropsType = unknown

/** 创建航线模板 */
const AddWaylineTemplate: FC<PropsType> = memo(() => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const msgApi = useAppMsg()

  const queryClient = useQueryClient()

  const { t, i18n } = useTranslation()

  const { data: modelsData } = useQuery(
    {
      queryKey: ['waylineModels'],
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
        name: 'waylineName',
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
        options: createWaylineTypeOptions(t),
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

  /** 生成跳转参数并打开编辑页 */
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

    // 从 URL query 参数中获取 folderId 并透传
    const folderId = searchParams.get('folderId')
    const folderIdParam = folderId ? `&folderId=${folderId}` : ''

    navigate(
      `/wayline/${to}?name=${v.waylineName}${modelName}${camera}${pointCloud3DParams}${folderIdParam}`,
    )
  }

  return (
    <>
      <IconButton
        tippyProps={{
          content: t('wayline.create.title'),
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

AddWaylineTemplate.displayName = 'AddWaylineTemplate'

export default AddWaylineTemplate
