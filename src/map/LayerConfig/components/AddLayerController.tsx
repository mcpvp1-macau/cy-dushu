import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { addLayer } from '@/service/modules/layer_overlay'

const formItems = [
  {
    label: '图层名称',
    name: 'layerName',
    type: 'input',
    rules: [{ required: true }],
  },
] as XFormItem[]

type PropsType = unknown

const AddLayerController: FC<PropsType> = memo(() => {
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

  return (
    <>
      <IconButton toolTipProps={{ title: '添加图层' }} onClick={openAddLayer}>
        <IconPlus />
      </IconButton>
      <FormModal
        title="新增图层"
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
