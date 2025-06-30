import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import { updateLayer, getLayerList } from '@/service/modules/reconstruction'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = {
  data: API_RECONSTRUCTION.Layer
}

export const EditReconstructionLayer: FC<PropsType> = (props) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const [layerGroupList, updateLayerList] = useReconstructionMap((s) => [
    s.layerGroupList,
    s.updateLayerList,
  ])
  const handleConfirm = async (values: {
    layerName: string
    layerId: number
  }) => {
    try {
      await updateLayer({
        overlayId: props.data.layerId,
        overlayName: values.layerName,
        layerId: values.layerId,
      })
      const data = await getLayerList({
        layerIds: layerGroupList.map((item) => item.id),
      })
      updateLayerList(data.data)
      msgApi.success(t('api.success.msg'))
    } finally {
      close()
    }
  }

  const formItems = useMemo(
    () =>
      [
        {
          label: t('mapLayer.reconstructionMap.edit.form.layerName'),
          name: 'layerName',
          type: 'input',
          rules: [{ required: true }],
        },
        {
          label: t('mapLayer.reconstructionMap.edit.form.groupName'),
          name: 'layerId',
          type: 'select',
          options: layerGroupList.map((item) => ({
            label: item.layerName,
            value: item.id,
          })),
          rules: [{ required: true }],
        },
      ] as XFormItem[],
    [t, layerGroupList],
  )

  return (
    <>
      <IconButton className="scale-90" onClick={open}>
        <IconEdit />
      </IconButton>
      {isOpened && (
        <FormModal
          mask
          title={t('mapLayer.reconstructionMap.edit.layer.title')}
          open={isOpened}
          onClose={close}
          items={formItems}
          initialValues={{
            layerName: props.data.overlayName,
            layerId: props.data.layerId,
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

EditReconstructionLayer.displayName = 'EditReconstructionLayer'

export default EditReconstructionLayer
