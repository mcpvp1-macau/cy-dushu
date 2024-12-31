import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { addLayer } from '@/service/modules/layer_overlay'

type PropsType = unknown

const AddLayerController: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [addLayerOpen, { setFalse: closeAddLayer, setTrue: openAddLayer }] =
    useBoolean(false)

  const queryClient = useQueryClient()
  const handleConfirm = async (values: any) => {
    await addLayer(values)
    await queryClient.invalidateQueries({
      queryKey: ['layerList'],
    })
    closeAddLayer()
  }

  const formItems = useMemo(
    () =>
      [
        {
          label: t('mapLayer.createMap.form.layerName.title'),
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
        toolTipProps={{ title: t('mapLayer.setting.addLayer.title') }}
        onClick={openAddLayer}
      >
        <IconPlus />
      </IconButton>
      <FormModal
        title={t('mapLayer.setting.addLayer.title')}
        open={addLayerOpen}
        onClose={closeAddLayer}
        items={formItems}
        onConfirm={handleConfirm}
      />
    </>
  )
})

AddLayerController.displayName = 'AddLayerController'

export default AddLayerController
