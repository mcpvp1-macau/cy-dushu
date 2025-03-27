import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { createLayerGroupList } from '@/service/modules/reconstruction'
import { useAppMsg } from '@/hooks/useAppMsg'
export const AddReconstructionLayerGroup: FC = () => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const queryClient = useQueryClient()
  const handleConfirm = async (values: { groupName: string }) => {
    const data = await createLayerGroupList(values.groupName)
    if (data.code === 'SUCCESS') {
      msgApi.success(t('api.success.msg'))
    } else {
      msgApi.success(t('api.error.msg'))
    }
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-groupList'],
    })
    close()
  }

  const formItems = useMemo(
    () =>
      [
        {
          label: t('mapLayer.reconstructionMap.create.form.groupName'),
          name: 'groupName',
          type: 'input',
          rules: [{ required: true }],
        },
      ] as XFormItem[],
    [t],
  )

  return (
    <>
      <IconButton
        toolTipProps={{
          title: t('mapLayer.reconstructionMap.create.tooltip'),
        }}
        onClick={() => {
          open()
        }}
      >
        <IconPlus />
      </IconButton>
      <FormModal
        title={t('mapLayer.reconstructionMap.create.tooltip')}
        open={isOpened}
        onClose={close}
        items={formItems}
        onConfirm={handleConfirm}
      />
    </>
  )
}

AddReconstructionLayerGroup.displayName = 'AddReconstructionLayerGroup'

export default AddReconstructionLayerGroup
