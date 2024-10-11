import { memo, type FC } from 'react'
import CloseableHeader from '../components/CloseableHeader'
import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import AppCollapse from '@/components/AppCollapse'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { useUnmount } from 'ahooks'

type PropsType = unknown

const presetColors = [
  '#ffffff',
  '#000000',
  '#64748b',
  '#6b7280',
  '#71717a',
  '#737373',
  '#78716c',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
]

const header = (
  <div className="flex gap-2 items-center">
    <IconAddMark className="device-detail-icon" />
    <h6 className="text-white text-base">点位标记</h6>
  </div>
)

const AddPoint: FC<PropsType> = memo(() => {
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)

  useUnmount(() => {
    updateDrawing(DrawType.None)
  })

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>{header}</CloseableHeader>
      <AppCollapse
        defaultActiveKey={['point']}
        items={[
          {
            key: 'point',
            label: '点位',
            children: (
              <div className="flex flex-wrap gap-2 gap-x-3.5 m-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="flex items-center gap-2 justify-center hover:bg-ground-300 p-1 rounded-md hover:scale-125 transition-all"
                    onClick={() => {
                      updateDrawing(DrawType.Point)
                      updateDrawingColor(color)
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
})

AddPoint.displayName = 'AddPoint'

export default AddPoint
