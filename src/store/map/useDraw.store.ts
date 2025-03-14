import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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

type StateType = {
  drawing: DrawType
  drawingColor: string
}

type ActionsType = {
  updateDrawing: (drawing: DrawType) => void
  updateDrawingColor: (color: string) => void
}

const useMapDrawStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      drawing: DrawType.None,
      drawingColor: '#0ea5e9',
      updateDrawing: (drawing) => {
        set({ drawing }, false, 'updateDrawing')
      },
      updateDrawingColor: (drawingColor) => {
        set({ drawingColor }, false, 'updateDrawingColor')
      },
    }),
    {
      name: 'map-draw-store',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapDrawStore
