import { ComponentRef } from 'react'
import CloseableHeader from '../components/CloseableHeader'
import useRightMode from '@/store/layout/useRightMode.store'
import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import AppEmpty from '@/components/AppEmpty'
import { shouldJson } from '@/utils/json'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Form, Input } from 'antd'
import IconTick from '@/assets/icons/jsx/IconTick'
import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import { useForm } from 'antd/es/form/Form'
import { updateLayer, deleteLayer } from '@/service/modules/reconstruction'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

const ReconstructionDetail: FC = () => {
  const detailId = useRightMode((s) => s.detailId)
  const layerList = useReconstructionMap((s) => s.layerList)
  const { t } = useTranslation()

  const [isEdit, { toggle, setFalse }] = useBoolean(false)

  const layer = useMemo(() => {
    return layerList.filter((layer) => layer.overlayId == Number(detailId))[0]
  }, [layerList, detailId])

  const styleConfig = useMemo(() => {
    return JSON.parse(layer?.overlayStyleConfig || '{}')
  }, [layer])

  const [form] = useForm<{
    overlayName?: string
  }>()

  useEffect(() => {
    form.setFieldsValue({
      overlayName: layer.overlayName,
    })
  })

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

  const queryClient = useQueryClient()

  const handleSave = async () => {
    setFalse()
    const value = form.getFieldsValue()
    await updateLayer({
      overlayId: layer.overlayId,
      overlayName: value.overlayName || '',
      layerId: layer.layerId,
    })
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-layerList'],
    })
  }

  const handleDelete = async () => {
    await deleteLayer(layer.overlayId)
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-layerList'],
    })
  }

  return (
    <div className="w-[350px] backdrop-blur">
      <Form form={form}>
        <CloseableHeader>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <IconRebuild3d />
              <Form.Item noStyle name="overlayName">
                {isEdit ? (
                  <Input ref={inputRef} size="small" />
                ) : (
                  <h6 className="text-white text-base max-w-[190px] truncate">
                    {layer?.overlayName || '-'}
                  </h6>
                )}
              </Form.Item>
            </div>
            <div className="flex gap-2">
              {isEdit ? (
                <IconAsyncButton
                  tippyProps={{ content: t('common.save') }}
                  onClick={handleSave}
                >
                  <IconTick className="scale-90" />
                </IconAsyncButton>
              ) : (
                <IconButton
                  tippyProps={{ content: t('common.edit') }}
                  onClick={() => {
                    toggle()
                    setTimeout(() => {
                      inputRef.current?.focus()
                    }, 333)
                  }}
                >
                  <IconEdit className="scale-90" />
                </IconButton>
              )}
              <IconAsyncButton
                tippyProps={{ content: t('common.delete') }}
                onClick={handleDelete}
              >
                <IconDelete className="scale-90" />
              </IconAsyncButton>
            </div>
          </div>
        </CloseableHeader>

        {layer ? (
          <div className="mx-3 mb-3 flex flex-col gap-2 text-sm">
            <p className="flex gap-2">
              {t('common.createTime')}:
              <span className="text-white">{layer.gmtCreate}</span>
            </p>
            <p className="flex gap-2">
              {t('overlay.detail.createUser.title')}:
              <span className="text-white">{layer.gmtCreateBy}</span>
            </p>
            <p className="flex gap-2">
              {t('overlay.detail.position.title')}:
              <span className="text-white">
                {shouldJson(layer.overlayPositions)[0]
                  .slice(0, 2)
                  .map((position: number) => position.toFixed(6))
                  .join(', ')}
              </span>
            </p>
            <p className="flex gap-2">
              <span className="whitespace-nowrap">
                {t('overlay.detail.mark.title')}:
              </span>
              <Form.Item noStyle name="remarks">
                {isEdit ? (
                  <Input size="small" className="h-5" />
                ) : (
                  <span className="text-white">
                    {styleConfig.remarks || '-'}
                  </span>
                )}
              </Form.Item>
            </p>
          </div>
        ) : (
          <AppEmpty />
        )}
      </Form>
    </div>
  )
}

ReconstructionDetail.displayName = 'ReconstructionDetail'

export default ReconstructionDetail
