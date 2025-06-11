import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import mitt from 'mitt'

export const drawingMitt = mitt()

export enum CotType {
  POINT = 'b-m-p-s-m', // 小圆点
  POINT_ZHONLI = 'a-n-G',
  POINT_DIFANG = 'a-h-G',
  POINT_YOUFANG = 'a-f-G',
  POINT_WEIZHI = 'a-u-G',
  SHAPE_POLYGON = 'u-d-f', // 多边形正方形
  SHAPE_CIRCLE = 'u-d-c-c', // 圆形
  SHAPE_FAN = 'shan-xing', // 扇形
  LINE_LUJING = 'b-m-r',
  CHEAT_LIAOTIAN = 'b-t-f',
  NONE = '',
}

export enum DrawType {
  None = 0,
  Point = 1,
  Circle = 2,
  Rect = 3,
  Polygon = 4,
  Fan = 5,
  RangingLine = 6,
  RangingArea = 7,
  RangingCircle = 8,
  RangingAngle = 9,
  ReconstructionArea = 10,
}

export type PointIconType =
  | 'COT_MAPPING_SPOTMAP/b-m-p-s-m/'
  | 'COT_MAPPING_2525C/a-n/a-n-G'
  | 'COT_MAPPING_2525C/a-h/a-h-G'
  | 'COT_MAPPING_2525C/a-f/a-f-G'
  | 'COT_MAPPING_2525C/a-u/a-u-G'
  | ''

export type LineStyle = 'solid' | 'dashed' | 'no-fly'

type StateType = {
  drawing: DrawType
  drawingColor: string
  lineStyle: LineStyle
  fillOpacity: number
}

type ActionsType = {
  updateDrawing: (drawing: DrawType) => void
  updateDrawingColor: (color: string) => void
  quitRecontructionArea: () => void
  updateLineStyle: (lineStyle: LineStyle) => void
  updateFillOpacity: (fillOpacity: number) => void
}

// 新增的三维重建也有绘制逻辑，并且其优先级应该最高，也就是无法从三维重建状态转为普通绘制和测量
// 又因为关闭测量绘制窗口的时候，会将drawing设置为none，在三维重建中点击测量又关闭后会出bug
// 所以三维重建状态无法通过updateDrawing进行关闭，只能通过quitRecontructionArea关闭
const useMapDrawStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      drawing: DrawType.None,
      drawingColor: '#0ea5e9',
      lineStyle: 'solid',
      fillOpacity: 0.5,
      updateDrawing: (drawing) => {
        // 如果是三维重建转为其他绘制，那么不响应，并且发送事件，在三维重建中收到事件并提醒用户
        const pre = get().drawing
        if (pre === DrawType.ReconstructionArea) {
          if (drawing === DrawType.None) {
            // 三维测量无法在此关闭，所以不做处理
          } else {
            // 三维测量无法转为其他绘制
            drawingMitt.emit('reconstruction-to-other')
          }
        } else {
          set({ drawing }, false, 'updateDrawing')
        }
      },
      updateDrawingColor: (drawingColor) => {
        set({ drawingColor }, false, 'updateDrawingColor')
      },
      quitRecontructionArea: () => {
        set({ drawing: DrawType.None }, false, 'quitRecontructionArea')
      },
      updateLineStyle: (lineStyle: LineStyle) => {
        set({ lineStyle }, false, 'updateLineStyle')
      },
      updateFillOpacity: (fillOpacity: number) => {
        set({ fillOpacity }, false, 'updateFillOpacity')
      }
    }),
    {
      name: 'map-draw-store',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapDrawStore
