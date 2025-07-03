import { useBoolean } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'
import { hexToARGB, getHexWithAlpha } from '@/utils/other/utils'
import { shouldJson } from '@/utils/json'
import { CotType } from '@/store/map/useDraw.store'
import {
  deleteFlightArea,
  updateFlightArea,
} from '@/service/modules/flightArea'
import { useForm } from 'antd/es/form/Form'
import { argbToHex } from '@/utils/color'
import useMapDrawStore from '@/store/map/useDraw.store'
import useFlightAreaStore from '@/store/map/useFlightArea.store'

const useFlightAreaDetail = (
  detailId: string | null,
  onDelete?: () => void,
) => {
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)
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
    return flightAreaList.find((e) => e.overlayId === d)
  }, [detailId, flightAreaList])

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
          '-value': `${lineStyle}`, // 描边类型 'solid|'dashed'|'no-fly
        },
        remarks: value.remarks,
      }
    }

    try {
      setConfirmLoading(true)
      await updateFlightArea({
        ...overlay!,
        overlayPositions: JSON.stringify(positions),
        overlayBindActions: overlay!.overlayBindType,
        overlayName: (value.overlayName || overlay?.overlayName) ?? '',
        overlayStyleConfig: JSON.stringify(overlayStyleConfig),
        overlayExtType: value.overlayExtType,
      })
      // 预防抖动，更新完成后数据无法立刻请求到最新的，所以先保留编辑状态一下下
      setTimeout(() => {
        setFalse()
      }, 200)
      queryClient.invalidateQueries({
        queryKey: ['getFlightAreaList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setConfirmLoading(true)
      await deleteFlightArea([overlay!.overlayId])
      onDelete?.()
      await queryClient.invalidateQueries({
        queryKey: ['getFlightAreaList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const [form] = useForm<{
    overlayName?: string
    remarks?: string
    overlayExtType?: string
  }>()

  useEffect(() => {
    form.setFieldsValue({
      overlayName: overlay?.overlayName,
      remarks: styleConfig?.remarks,
      overlayExtType: overlay?.overlayExtType,
    })
  }, [styleConfig])

  return {
    form,
    isConfirmLoading,
    isEdit,
    overlay,
    styleConfig,
    setFalse,
    toggle,
    handleDelete,
    handleSave,
  }
}

useFlightAreaDetail.displayName = 'useFlightAreaDetail'

export default useFlightAreaDetail
