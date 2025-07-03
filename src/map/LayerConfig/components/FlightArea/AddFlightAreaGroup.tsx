import IconPlus from '@/assets/icons/jsx/IconPlus'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { addFlightAreaGroup } from '@/service/modules/flightArea'
import { useAppMsg } from '@/hooks/useAppMsg'
import useUserStore from '@/store/useUser.store'
import { Button } from 'antd'

type Node = {
  label: string
  value: string
  children: Node[]
}

/**递归的选择所有子节点 */
const recursionSelect = (data: Node[]) => {
  const result: string[] = []

  const nodeSelect = (node: Node) => {
    result.push(node.value)
    node.children.forEach(nodeSelect)
  }
  data.forEach(nodeSelect)

  return result
}

export const AddFlightAreaGroup: FC = () => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()
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

  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const queryClient = useQueryClient()
  const handleConfirm = async (values: any) => {
    const data = await addFlightAreaGroup({
      layerName: values.layerName,
      effectiveGroups: values.effectiveGroups.join(',') || '',
    })
    if (data.code === 'SUCCESS') {
      msgApi.success(t('api.success.msg'))
    } else {
      msgApi.success(t('api.error.msg'))
    }
    await queryClient.invalidateQueries({
      queryKey: ['getFlightAreaGroupList'],
    })
    close()
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
            onSelect: (value: string, node: Node) => {
              return recursionSelect([node])
            },
          },
        },
      ] as XFormItem[],
    [t],
  )

  return (
    <>
      <Button icon={<IconPlus />} block onClick={open}>
        {t('flightArea.create.group.tooltip')}
      </Button>
      <FormModal
        title={t('flightArea.create.group.tooltip')}
        mask
        open={isOpened}
        onClose={close}
        items={formItems}
        onConfirm={handleConfirm}
      />
    </>
  )
}

AddFlightAreaGroup.displayName = 'AddFlightAreaGroup'

export default AddFlightAreaGroup
