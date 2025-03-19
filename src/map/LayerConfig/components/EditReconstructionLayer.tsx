import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import { updateLayer, getLayerList } from '@/service/modules/reconstruction'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = {
  id: number
}

export const AddReconstructionLayer: FC<PropsType> = (props) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const [layerGroupList, updateLayerList] = useReconstructionMap((s) => [
    s.layerGroupList,
    s.updateLayerList,
  ])
  const handleConfirm = async (values: { layerName: string }) => {
    try {
      await updateLayer({
        overlayId: props.id,
        overlayName: values.layerName,
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
      ] as XFormItem[],
    [t],
  )

  return (
    <>
      <IconButton
        className="scale-90"
        onClick={() => {
          open()
        }}
      >
        <IconEdit />
      </IconButton>
      <FormModal
        title={t('mapLayer.reconstructionMap.edit.layer.title')}
        open={isOpened}
        onClose={close}
        items={formItems}
        onConfirm={handleConfirm}
      />
    </>
  )
}

AddReconstructionLayer.displayName = 'AddReconstructionLayer'

export default AddReconstructionLayer
