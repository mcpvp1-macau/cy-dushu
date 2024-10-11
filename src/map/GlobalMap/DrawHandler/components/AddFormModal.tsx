import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { GetProps } from 'antd'
import { BaseOptionType } from 'antd/es/select'
import { memo, type FC } from 'react'

type FormModalProps = GetProps<typeof FormModal>

type PropsType = Partial<FormModalProps> &
  Pick<FormModalProps, 'open' | 'onConfirm' | 'onClose'>

const createFormItems = (options: BaseOptionType) =>
  [
    {
      label: '点位名称',
      name: 'overlayName',
      type: 'input',
      rules: [{ required: true, message: '请输入点位名称' }],
    },
    {
      label: '所属图层',
      name: 'layerId',
      type: 'select',
      options,
      rules: [{ required: true, message: '请选择所属图层' }],
    },
  ] as XFormItem[]

const AddFormModal: FC<PropsType> = memo((props) => {
  const layerList = useMapLayerAndOverlayStore((s) => s.layerList)
  const layerOptions = useMemo(
    () =>
      layerList.map((layer) => ({
        label: layer.layerName,
        value: layer.layerId,
      })),
    [layerList],
  )

  const items = useMemo(() => createFormItems(layerOptions), [layerOptions])

  return (
    <FormModal title={props.title ?? '新增区域'} {...props} items={items} />
  )
})

AddFormModal.displayName = 'AddFormModal'

export default AddFormModal
