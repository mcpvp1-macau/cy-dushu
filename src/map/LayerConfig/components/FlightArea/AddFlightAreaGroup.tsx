import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import {
  addFlightAreaGroup,
  updateFlightAreaGroup,
} from '@/service/modules/flightArea'
import { useAppMsg } from '@/hooks/useAppMsg'
import useUserStore, { type GroupDeviceTree } from '@/store/useUser.store'
import { Button, TreeSelect } from 'antd'

// 无人机和无人机机场可以使用飞行区域
const usedFlightAreaDevice = ['UAV', 'UAV_AIRPORT']

type PropsAddType = {
  type: 'add'
}

type PropsEditType = {
  type: 'edit'
  data: API_FLIGHT_AREA.domain.FlightAreaGroup
}

export const AddFlightAreaGroup: FC<PropsAddType | PropsEditType> = (props) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()

  const groupDeviceTree = useUserStore((s) => s.groupDeviceTree)

  /** 过滤掉除无人机和机场外的设备树，且去其中掉没有设备的组织 */
  const fliterGroupDeviceTree = useMemo(() => {
    // 先过滤掉除无人机和机场外的设备树
    const result: GroupDeviceTree[] = []
    usedFlightAreaDevice.forEach((key) => {
      const item = groupDeviceTree.find((e) => e.value === key)
      if (item) {
        result.push(item)
      }
    })

    /**递归的判断该组织下以及所有子组织是否有设备 */
    const hasDevice = (data: GroupDeviceTree[]) => {
      let has = false

      const recursiveFn = (data: GroupDeviceTree[]) => {
        data.forEach((item) => {
          if (item.type === 'DeviceItem') {
            has = true
            return
          }
          if (item.type === 'Group' && item.children.length === 0) {
            return
          } else {
            recursiveFn(item.children)
          }
        })
      }
      recursiveFn(data)

      return has
    }

    /**递归的删除没有设备的组织 */
    const deleteGroupWithoutDevice = (data: GroupDeviceTree[]) => {
      const tempResult: GroupDeviceTree[] = []
      data.forEach((item) => {
        if (item.type === 'DeviceType' || item.type === 'DeviceItem') {
          tempResult.push({
            ...item,
            children: deleteGroupWithoutDevice(item.children),
          })
        } else if (item.type === 'Group' && hasDevice(item.children)) {
          tempResult.push({
            ...item,
            children: deleteGroupWithoutDevice(item.children),
          })
        } else {
          // 没有设备的组织就不添加进新树中了
        }
      })
      return tempResult
    }

    return deleteGroupWithoutDevice(result)
  }, [groupDeviceTree])

  /** 选中的设备id值 */
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])

  const [isOpened, { setTrue: open, setFalse: close }] = useBoolean(false)
  const queryClient = useQueryClient()
  const handleConfirm = async (values: any) => {
    let data
    if (props.type === 'add') {
      data = await addFlightAreaGroup({
        layerName: values.layerName,
        effectiveGroups: groupIds.join(','),
        effectiveDevices: deviceIds.join(','),
      })
    } else {
      data = await updateFlightAreaGroup({
        layerId: props.data.layerId,
        layerName: values.layerName,
        effectiveGroups: groupIds.join(','),
        effectiveDevices: deviceIds.join(','),
      })
    }

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
          label: t('flightArea.create.form.effective'),
          name: 'effective',
          type: 'tree-select',
          treeData: fliterGroupDeviceTree,
          treeExpandAction: false,
          rules: [{ required: true }],
          otherProps: {
            value: deviceIds,
            treeCheckable: true,
            showCheckedStrategy: TreeSelect.SHOW_CHILD,
            allowClear: true,
            maxTagCount: 10,
            onChange: (value) => {
              const deviceSet = new Set<string>([...value])
              const groupIdSet = new Set<string>()
              // 递归树，将所有选中的设备所关联的组织id添加到groupIdSet中
              const recursiveFn = (data: GroupDeviceTree[]) => {
                data.forEach((item) => {
                  if (item.type === 'DeviceItem' && deviceSet.has(item.value)) {
                    item.relatedGroup.forEach((e) => {
                      groupIdSet.add(e)
                    })
                  } else {
                    recursiveFn(item.children)
                  }
                })
              }
              recursiveFn(fliterGroupDeviceTree)

              setDeviceIds(value)
              setGroupIds(Array.from(groupIdSet))
            },
          },
        },
      ] as XFormItem[],
    [t, fliterGroupDeviceTree],
  )

  return (
    <>
      {props.type === 'add' ? (
        <Button icon={<IconPlus />} block onClick={open}>
          {t('flightArea.create.group.tooltip')}
        </Button>
      ) : (
        <IconButton className="scale-90" onClick={open}>
          <IconEdit />
        </IconButton>
      )}

      <FormModal
        title={
          props.type === 'add'
            ? t('flightArea.create.group.tooltip')
            : t('flightArea.edit.group.tooltip')
        }
        mask
        open={isOpened}
        onClose={close}
        items={formItems}
        initialValues={{
          layerName: props?.type === 'edit' ? props.data?.layerName : '',
          effective:
            props?.type === 'edit'
              ? props.data?.effectiveDevices?.split(',')
              : [],
        }}
        onConfirm={handleConfirm}
      />
    </>
  )
}

AddFlightAreaGroup.displayName = 'AddFlightAreaGroup'

export default AddFlightAreaGroup
