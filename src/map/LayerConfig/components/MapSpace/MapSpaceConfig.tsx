import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { delSpace, updSpace } from '@/service/modules/layer_overlay'
import { fileToBase64 } from '@/utils/base64'
import { shouldJson } from '@/utils/json'
import { LoadingOutlined } from '@ant-design/icons'
import { Checkbox, Form } from 'antd'
import { v4 } from 'uuid'
import useAddMapFormItems from '../../hooks/useAddMapFormItems'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.SpaceItem
  checked?: boolean
  onChange?: (checked: boolean) => void
  onRefresh?: () => void
}

const MapSpaceConfig: FC<PropsType> = memo(
  ({ data, checked, onChange, onRefresh }) => {
    const spaceConfig = useMemo(() => shouldJson(data.spaceConfig), [data])
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const { t } = useTranslation()

    const msgApi = useAppMsg()
    const handleDelete = async () => {
      setLoading(true)
      try {
        await delSpace(data.id)
        msgApi.success(t('api.success.msg'))
        await queryClient.invalidateQueries({
          queryKey: ['getSpaceList'],
        })
        onRefresh?.()
      } finally {
        setLoading(false)
      }
    }

    const [form] = Form.useForm()

    const spaceFormItems = useAddMapFormItems(form)

    const [open, { setTrue, setFalse }] = useBoolean(false)

    useEffect(() => {
      form.setFieldsValue({
        ...data,
      })
      if (spaceConfig?.mapPerviewUrl?.[0]?.thumbUrl) {
        form.setFieldsValue({
          mapPreviewUrl: [
            {
              uid: '0',
              name: t('common.preview'),
              status: 'done',
              url: spaceConfig?.mapPerviewUrl?.[0].thumbUrl,
              preview: spaceConfig?.mapPerviewUrl?.[0].thumbUrl,
            },
          ],
          ['WMTS.layer']: spaceConfig?.layer,
          ['WMTS.style']: spaceConfig?.style,
          ['WMTS.tileMatrixSetID']: spaceConfig?.tileMatrixSetID,
          ['WMTS.format']: spaceConfig?.format,
          ['WMTS.tileMatrixLabels']: spaceConfig?.tileMatrixLabels,
          ['WMTS.tilingScheme']: spaceConfig?.tilingScheme,
        })
      }
    }, [data, t])

    const handleConfirm = async (values: any) => {
      if (values.mapPreviewUrl[0]?.url) {
        const spaceConfig = JSON.stringify({
          mapPerviewUrl: [
            {
              thumbUrl: values.mapPreviewUrl[0].url,
              isAdd: true,
            },
          ],
          layer: values['WMTS.layer'],
          style: values['WMTS.style'],
          tileMatrixSetID: values['WMTS.tileMatrixSetID'],
          format: values['WMTS.format'],
          tileMatrixLabels: values['WMTS.tileMatrixLabels'],
          tilingScheme: values['WMTS.tilingScheme'],
        })
        values.spaceConfig = spaceConfig
      } else {
        const base64 = await fileToBase64(values.mapPreviewUrl[0].originFileObj)
        if (base64 === null) {
          msgApi.error(t('mapLayer.errors.previewParse.msg'))
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
          layer: values['WMTS.layer'],
          style: values['WMTS.style'],
          tileMatrixSetID: values['WMTS.tileMatrixSetID'],
          format: values['WMTS.format'],
          tileMatrixLabels: values['WMTS.tileMatrixLabels'],
          tilingScheme: values['WMTS.tilingScheme'],
        })
        values.spaceConfig = spaceConfig
      }
      values.id = data.id
      values.spaceId = v4()
      console.log('values', values)
      await updSpace(values)
      msgApi.success(t('api.success.msg'))
      await queryClient.invalidateQueries({
        queryKey: ['getSpaceList'],
      })
      onRefresh?.()
      setFalse()
    }

    return (
      <div
        key={data.spaceId}
        className="h-28 w-full relative rounded-[3px] overflow-hidden"
      >
        <img
          src={spaceConfig?.mapPerviewUrl?.[0]?.thumbUrl}
          className="h-full w-full object-cover select-none pointer-events-none"
        />
        <div className="absolute bottom-0 left-0 right-0 px-3 bg-ground-1 bg-opacity-70 backdrop-blur flex justify-between">
          <p>
            <Checkbox
              checked={checked}
              onChange={(e) => {
                onChange?.(e.target.checked)
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
            title={t('mapLayer.updateMap.title')}
            open={open}
            onClose={setFalse}
            items={spaceFormItems}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    )
  },
)

MapSpaceConfig.displayName = 'MapSpaceConfig'

export default MapSpaceConfig
