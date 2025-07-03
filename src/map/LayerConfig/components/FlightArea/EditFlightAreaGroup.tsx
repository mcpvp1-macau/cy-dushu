import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useUserStore from '@/store/useUser.store'
import { updateFlightAreaGroup } from '@/service/modules/flightArea'
import { useAppMsg } from '@/hooks/useAppMsg'
import queryClient from '@/global/query-client'

type PropsType = {
  data: API_FLIGHT_AREA.domain.FlightAreaGroup
}

export const EditFlightAreaGroup: FC<PropsType> = (props) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()
  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const groupTree = useUserStore((s) => s.groupTree)

  const treeData = useMemo(() => {
    if (!groupTree) return []

    const generateData = (data: any[]) => {
      return data.map((item) => {
        return {
          label: item.groupName,
          value: item.groupId,
          children: generateData(item.children || []),
        }
      })
    }
    return generateData(groupTree.rows)
  }, [groupTree])

  const handleConfirm = async (values: {
    layerName: string
    effectiveGroups: string[]
  }) => {
    try {
      await updateFlightAreaGroup({
        layerId: props.data.layerId,
        layerName: values.layerName,
        effectiveGroups: values.effectiveGroups.join(','),
      })
      queryClient.invalidateQueries({
        queryKey: ['getFlightAreaGroupList'],
      })
      msgApi.success(t('api.success.msg'))
    } finally {
      close()
    }
  }

  const formItems = useMemo(
    () =>
      [
        {
          label: t('flightArea.create.form.layerName'),
          name: 'layerName',
          type: 'input',
          rules: [{ required: true }],
        },
        {
          label: t('flightArea.create.form.effectiveGroups'),
          name: 'effectiveGroups',
          type: 'tree-select',
          treeData: treeData,
          treeExpandAction: false,
          rules: [{ required: true }],
          otherProps: {
            allowClear: true,
            multiple: true,
            maxTagCount: 10,
          },
        },
      ] as XFormItem[],
    [t],
  )

  return (
    <>
      <IconButton className="scale-90" onClick={open}>
        <IconEdit />
      </IconButton>
      {isOpened && (
        <FormModal
          mask
          title={t('flightArea.create.group.tooltip')}
          open={isOpened}
          onClose={close}
          items={formItems}
          initialValues={{
            layerName: props.data.layerName,
            effectiveGroups: props.data.effectiveGroups.split(','),
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

EditFlightAreaGroup.displayName = 'EditFlightAreaGroup'

export default EditFlightAreaGroup
