import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { useAppMsg } from '@/hooks/useAppMsg'
import { delSpace, updSpace } from '@/service/modules/layer_overlay'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import { fileToBase64 } from '@/utils/base64'
import { shouldJson } from '@/utils/json'
import { LoadingOutlined } from '@ant-design/icons'
import { Checkbox, Form } from 'antd'
import { v4 } from 'uuid'

export const spaceFormItems = [
  {
    label: '地图名称',
    name: 'spaceName',
    type: 'input',
    rules: [{ required: true }],
  },
  {
    label: '地图类型',
    name: 'mapType',
    type: 'select',
    options: [
      { label: '经纬度地图', value: 'LNG_LAT' },
      { label: '点云地图', value: 'POINT_CLOUD', disabled: true },
    ],
  },
  {
    label: '瓦片类型',
    name: 'spaceType',
    type: 'select',
    options: [
      { label: 'xyz栅格瓦片', value: 'XYZ' },
      { label: '倾斜摄影', value: '3D_TILES' },
    ],
  },
  {
    label: '瓦片地址',
    name: 'spaceMapUrl',
    type: 'input',
  },
  {
    label: '权属',
    name: 'spaceSpecialType',
    type: 'select',
    options: [
      {
        label: '所有人可见',
        value: 'DEFAULT',
      },
      {
        label: '仅自己可见',
        value: 'NORMAL',
      },
    ],
  },
  {
    label: '预览图',
    type: 'upload',
    name: 'mapPreviewUrl',
    valuePropName: 'fileList',
    getValueFromEvent: (e: any) => {
      if (Array.isArray(e)) {
        return e
      }
      return e?.fileList
    },
    otherProps: {
      beforeUpload: () => false,
      accept: 'image/*',
      listType: 'picture',
      maxCount: 1,
    },
    rules: [{ required: true }],
  },
] as XFormItem[]

type PropsType = {
  data: API_LAYER_OVERLAY.domain.SpaceItem
}

const MapSpaceConfig: FC<PropsType> = memo(({ data }) => {
  const spaceConfig = useMemo(() => shouldJson(data.spaceConfig), [data])
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const msgApi = useAppMsg()
  const handleDelete = async () => {
    setLoading(true)
    try {
      await delSpace(data.id)
      msgApi.success('删除成功')
      await queryClient.invalidateQueries({
        queryKey: ['getSpaceList'],
      })
    } finally {
      setLoading(false)
    }
  }

  const [form] = Form.useForm()
  const [open, { setTrue, setFalse }] = useBoolean(false)

  useEffect(() => {
    form.setFieldsValue({
      ...data,
    })
    if (spaceConfig?.mapPerviewUrl?.[0].thumbUrl) {
      form.setFieldsValue({
        mapPreviewUrl: [
          {
            uid: '0',
            name: '预览图',
            status: 'done',
            url: spaceConfig?.mapPerviewUrl?.[0].thumbUrl,
            preview: spaceConfig?.mapPerviewUrl?.[0].thumbUrl,
          },
        ],
      })
    }
  }, [data])

  const handleConfirm = async (values: any) => {
    if (values.mapPreviewUrl[0]?.url) {
      values.mapPreviewUrl = [
        {
          thumbUrl: values.mapPreviewUrl[0].url,
          isAdd: false,
        },
      ]
    } else {
      const base64 = await fileToBase64(values.mapPreviewUrl[0].originFileObj)
      if (base64 === null) {
        msgApi.error('预览图解析失败')
        return
      }
      delete values.mapPreviewUrl
      const spaceConfig = JSON.stringify({
        mapPerviewUrl: [
          {
            thumbUrl: base64,
            isAdd: true,
          },
        ],
      })
      values.spaceConfig = spaceConfig
    }
    values.id = data.id
    values.spaceId = v4()
    await updSpace(values)
    msgApi.success('更新地图成功')
    await queryClient.invalidateQueries({
      queryKey: ['getSpaceList'],
    })
    setFalse()
  }

  const activeSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.activeSpaceIds,
  )
  const updateActiveSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.updateActiveSpaceIds,
  )

  return (
    <div
      key={data.spaceId}
      className="h-28 w-full relative rounded-[3px] overflow-hidden"
    >
      <img
        src={spaceConfig?.mapPerviewUrl?.[0].thumbUrl}
        className="h-full w-full object-cover select-none pointer-events-none"
      />

      <div className="absolute bottom-0 left-0 right-0 px-3 bg-ground-100 bg-opacity-70 backdrop-blur flex justify-between">
        <p>
          <Checkbox
            checked={activeSpaceIds.has(data.spaceId)}
            onChange={(e) => {
              if (e.target.checked) {
                updateActiveSpaceIds(new Set([...activeSpaceIds, data.spaceId]))
              } else {
                activeSpaceIds.delete(data.spaceId)
                updateActiveSpaceIds(new Set(activeSpaceIds))
              }
            }}
          >
            {data.spaceName}
          </Checkbox>
        </p>
        <p className="flex gap-2">
          {loading ? (
            <LoadingOutlined />
          ) : (
            <>
              <IconButton onClick={setTrue}>
                <IconEdit className="scale-90" />
              </IconButton>
              <IconButton onClick={handleDelete}>
                <IconDelete className="scale-90" />
              </IconButton>
            </>
          )}
        </p>
      </div>
      {open && (
        <FormModal
          form={form}
          title="新增地图"
          open={open}
          onClose={setFalse}
          items={spaceFormItems}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
})

MapSpaceConfig.displayName = 'MapSpaceConfig'

export default MapSpaceConfig
