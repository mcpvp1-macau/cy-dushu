import Select from '@/components/AntdOverride/Select'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { useTranslation } from 'react-i18next'

type PropsType = {
  onChange?: (type: DrawType) => void
}

const DrawingTypeSelectorCreating: FC<PropsType> = ({ onChange }) => {
  const { t } = useTranslation()

  const opts = [
    {
      label: t('overlay.drawing.circle.title'),
      value: DrawType.Circle,
    },
    {
      label: t('overlay.drawing.polygon.title'),
      value: DrawType.Polygon,
    },
  ]

  const drawingType = useMapDrawStore((s) => s.drawing)

  return (
    <Select
      value={drawingType}
      options={opts}
      className="w-20"
      size="small"
      onChange={(v) => {
        onChange?.(v)
        useMapDrawStore.getState().updateDrawing(v)
      }}
    />
  )
}
DrawingTypeSelectorCreating.displayName = 'DrawingTypeSelectorCreating'

export default DrawingTypeSelectorCreating
