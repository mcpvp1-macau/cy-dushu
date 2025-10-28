import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

export enum CotType {
  POINT = 'b-m-p-s-m', // 小圆点
  POINT_ZHONLI = 'a-n-G',
  POINT_DIFANG = 'a-h-G',
  POINT_YOUFANG = 'a-f-G',
  POINT_WEIZHI = 'a-u-G',
  SHAPE_POLYGON = 'u-d-f', // 多边形正方形
  SHAPE_CIRCLE = 'u-d-c-c', // 圆形
  SHAPE_FAN = 'shan-xing', // 扇形
  SHAPE_RECT = 'rectangle',
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

// useRightMode保存处于详情编辑的覆盖物，此处的isEdit用于保存覆盖物是否处于编辑状态

type StateType = {
  drawing: DrawType
  drawingColor: string
  lineStyle: LineStyle
  /**透明度 0-1 */
  fillOpacity: number
  /**编辑后的点位，不用于地图显示，用于上传 */
  positions: [number, number, number?][]
  /**用于判断覆盖物是否处于编辑状态 */
  isEdit: boolean
  /**是否绘制的是飞行区域，飞行区域和普通绘制弹窗不一样 */
  isFlightArea: boolean
  /** 是否在绘制设备绑定区域 */
  isDrawingDeviceOverlay: boolean
  /** 绑定设备ID */
  bindingDeviceId: string
  /** 初始绘制中心点 (用于可飞行区域标识设备中心位置) */
  devicePosition: [number, number] | null
}

type ActionsType = {
  updateDrawing: (drawing: DrawType) => void
  updateDrawingColor: (color: string) => void
  quitRecontructionArea: () => void
  updateLineStyle: (lineStyle: LineStyle) => void
  updateFillOpacity: (fillOpacity: number) => void
  /**更新编辑后的点位，该数据不用于地图显示，用于上传 */
  updatePositions: (positions: [number, number, number?][]) => void
  updateIsEdit: (isEdit: boolean) => void
  updateIsFlightArea: (isFlightArea: boolean) => void
  /** 更新是否在绘制设备绑定区域 */
  updateIsDrawingDeviceArea: (isDrawingDeviceArea: boolean) => void
  /** 更新绑定设备ID */
  updateBindingDeviceId: (bindingDeviceId: string) => void
  /** 更新初始绘制中心点 */
  updateDevicePosition: (center: [number, number] | null) => void
}

// 新增的三维重建也有绘制逻辑，并且其优先级应该最高，也就是无法从三维重建状态转为普通绘制和测量
// 又因为关闭测量绘制窗口的时候，会将drawing设置为none，在三维重建中点击测量又关闭后会出bug
// 所以三维重建状态无法通过updateDrawing进行关闭，只能通过quitRecontructionArea关闭
const useMapDrawStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set, get) => ({
        drawing: DrawType.None,
        drawingColor: '#4C90F0',
        lineStyle: 'solid',
        fillOpacity: 0.5,
        positions: [],
        isEdit: false,
        isFlightArea: false,
        isDrawingDeviceOverlay: false,
        bindingDeviceId: '',
        devicePosition: null,
        updateDrawing: (drawing) => {
          // 如果是三维重建转为其他绘制，那么不响应
          const pre = get().drawing
          if (pre === DrawType.ReconstructionArea) {
            //  三维测量无法在此关闭且无法转为其他绘制，所以不做处理
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
        },
        updatePositions: (positions) => {
          set({ positions }, false, 'updatePositions')
        },
        updateIsEdit: (isEdit) => {
          set({ isEdit }, false, 'updateIsEdit')
        },
        updateIsFlightArea: (isFlightArea: boolean) => {
          set({ isFlightArea }, false, 'updateIsFlightArea')
        },
        updateIsDrawingDeviceArea: (isDrawingDeviceArea: boolean) => {
          set(
            { isDrawingDeviceOverlay: isDrawingDeviceArea },
            false,
            'updateIsDrawingDeviceArea',
          )
        },
        updateBindingDeviceId: (bindingDeviceId: string) => {
          set({ bindingDeviceId }, false, 'updateBindingDeviceId')
        },
        updateDevicePosition: (center: [number, number] | null) => {
          set({ devicePosition: center }, false, 'updateInitialDrawCenter')
        },
      }),
      // isFlightArea需要持久化以配合rightMode的持久化
      {
        name: 'map-draw-store',
        storage: createJSONStorage(() => sessionStorage, {
          replacer: (key: string, value: any) => {
            return value
          },
          reviver: (key: string, value: any) => {
            return value
          },
        }),
        partialize: (state) => ({ isFlightArea: state.isFlightArea }),
      },
    ),
    {
      name: 'map-draw-store',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapDrawStore
