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
import useMapDrawStore from '@/store/map/useDraw.store'

const useOverlayDetail = (detailId: string | null, onDelete?: () => void) => {
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const updateFillOpacity = useMapDrawStore((s) => s.updateFillOpacity)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const updateLineStyle = useMapDrawStore((s) => s.updateLineStyle)
  const positions = useMapDrawStore((s) => s.positions)
  const updatePositions = useMapDrawStore((s) => s.updatePositions)
  const updateIsEdit = useMapDrawStore((s) => s.updateIsEdit)

  const overlay = useMemo(() => {
    if (!detailId) return null
    const d = +detailId
    return overlayList.find((e) => e.overlayId === d)
  }, [detailId, overlayList])

  const [isEdit, { toggle, setFalse }] = useBoolean(false)

  useEffect(() => {
    updateIsEdit(isEdit)
  }, [isEdit])

  const queryClient = useQueryClient()

  const styleConfig = useMemo(
    () => shouldJson(overlay?.overlayStyleConfig),
    [overlay],
  )

  // 同步样式状态
  useEffect(() => {
    const overlayPositions = shouldJson(overlay?.overlayPositions)
    const style = shouldJson(overlay?.overlayStyleConfig)

    const fillColor =
      argbToHex(String(style?.fillColor?.['-value']))?.[0] || '#4c90f0'
    const fillOpacity = parseFloat(style?.fillOpacity?.['-value']) || 0.5
    const strokeStyle = style?.strokeStyle?.['-value'] || 'solid'

    updateDrawingColor(fillColor)
    updateFillOpacity(fillOpacity)
    updateLineStyle(strokeStyle)
    updatePositions(overlayPositions)
  }, [overlay])

  const [isConfirmLoading, setConfirmLoading] = useState(false)
  const handleSave = async () => {
    const value = form.getFieldsValue()

    let overlayStyleConfig: Record<string, any> = {}
    if (overlay?.cotType === CotType.POINT) {
      const colorRGBA = hexToARGB(drawingColor)
      overlayStyleConfig = {
        ...styleConfig,
        color: {
          '-argb': colorRGBA,
          hex: drawingColor,
        },
        remarks: value.remarks,
      }
    } else {
      const strokeColorHex = getHexWithAlpha(drawingColor, 1)
      const strokeColorARGB = hexToARGB(strokeColorHex)
      const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
      const fillColorARGB = hexToARGB(fillColorHex)
      overlayStyleConfig = {
        ...styleConfig,
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        fillOpacity: {
          '-value': `${fillOpacity}`, //填充透明度0-1
        },
        strokeStyle: {
          '-value': `${lineStyle}`, // 描边类型 'solid|'dashed'
        },
        remarks: value.remarks,
      }
    }

    try {
      setConfirmLoading(true)
      await updateOverlay({
        ...overlay!,
        overlayPositions: JSON.stringify(positions),
        overlayBindActions: overlay!.overlayBindType,
        overlayName: (value.overlayName || overlay?.overlayName) ?? '',
        overlayStyleConfig: JSON.stringify(overlayStyleConfig),
      })
      // 预防抖动，更新完成后数据无法立刻请求到最新的，所以先保留编辑状态一下下
      setTimeout(() => {
        setFalse()
      }, 200)
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
    // overlayExtType?: string
  }>()

  useEffect(() => {
    form.setFieldsValue({
      overlayName: overlay?.overlayName,
      color: new AggregationColor(renderColor),
      remarks: styleConfig?.remarks,
      // overlayExtType: overlay?.overlayExtType || '',
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
