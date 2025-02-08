import { useBoolean } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'
import { hexToARGB, getHexWithAlpha } from '@/utils/other/utils'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { shouldJson } from '@/utils/json'
import { CotType } from '@/store/map/useDraw.store'
import { deleteOverlaies, updateOverlay } from '@/service/modules/layer_overlay'
import { useForm } from 'antd/es/form/Form'
import { argbToHex } from '@/utils/color'
import { AggregationColor } from 'antd/es/color-picker/color'

const useOverlayDetail = (detailId: string | null, onDelete?: () => void) => {
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)

  const overlay = useMemo(() => {
    if (!detailId) return null
    const d = +detailId
    return overlayList.find((e) => e.overlayId === d)
  }, [detailId, overlayList])

  const [isEdit, { toggle, setFalse }] = useBoolean(false)

  const queryClient = useQueryClient()

  const styleConfig = useMemo(
    () => shouldJson(overlay?.overlayStyleConfig),
    [overlay],
  )

  const [isConfirmLoading, setConfirmLoading] = useState(false)
  const handleSave = async () => {
    const value = form.getFieldsValue()
    const hexStr = value.color.toHexString()
    let overlayStyleConfig: Record<string, any> = {}
    if (overlay?.cotType === CotType.POINT) {
      const colorRGBA = hexToARGB(hexStr)
      overlayStyleConfig = {
        ...styleConfig,
        color: {
          '-argb': colorRGBA,
          hex: hexStr,
        },
        remarks: value.remarks,
      }
    } else {
      const strokeColorHex = getHexWithAlpha(hexStr, 1)
      const strokeColorARGB = hexToARGB(strokeColorHex)
      const fillColorHex = getHexWithAlpha(hexStr, 0.5)
      const fillColorARGB = hexToARGB(fillColorHex)
      overlayStyleConfig = {
        ...styleConfig,
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        remarks: value.remarks,
      }
    }

    try {
      setConfirmLoading(true)
      await updateOverlay({
        ...overlay!,
        overlayBindActions: overlay!.overlayBindType,
        overlayName: (value.overlayName || overlay?.overlayName) ?? '',
        overlayStyleConfig: JSON.stringify(overlayStyleConfig),
      })
      setFalse()
      queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setConfirmLoading(true)
      await deleteOverlaies([overlay!.overlayId])
      onDelete?.()
      await queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const renderColor = useMemo(() => {
    if (!styleConfig) {
      return '#fff'
    }
    const color =
      styleConfig?.color?.['-argb'] || styleConfig?.fillColor?.['-value']
    return argbToHex(String(color))[0]
  }, [overlay])

  const [form] = useForm<{
    overlayName?: string
    color: AggregationColor
    remarks?: string
  }>()

  useEffect(() => {
    form.setFieldsValue({
      overlayName: overlay?.overlayName,
      color: new AggregationColor(renderColor),
      remarks: styleConfig?.remarks,
    })
  }, [styleConfig, renderColor])

  return {
    form,
    isConfirmLoading,
    isEdit,
    overlay,
    renderColor,
    styleConfig,
    overlayList,
    setFalse,
    toggle,
    handleDelete,
    handleSave,
  }
}

export default useOverlayDetail
