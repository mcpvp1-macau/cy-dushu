import { create } from 'zustand'
import { limitNum } from '@/utils/math'
import {
  PointCloud3dTemplateType,
  PointCloud3DWaylineConfigType,
  PointCloud3DWaypointConfigType,
} from './types'
import { v4 } from 'uuid'

type StateType = {
  isDrawPoint: boolean
  isMovePoint: boolean
  spaceMapUrl: string
  waylineTemplateInfo: PointCloud3dTemplateType
  waylineConfig: PointCloud3DWaylineConfigType
  waypointsConfig: PointCloud3DWaypointConfigType[]
  currentIndex: number
  currentActionIndex: number
}

type ActionsType = {
  /** 重置 store */
  resetState: () => void
  /** 更新空间地图地址 */
  updateSpaceMapUrl: (spaceMapUrl: StateType['spaceMapUrl']) => void
  /** 设置是否在绘制航点 */
  updateIsDrawPoint: (isDrawPoint: StateType['isDrawPoint']) => void
  /** 设置是否在移动航点 */
  updateIsMovePoint: (isMovePoint: StateType['isMovePoint']) => void
  /** 更新航线模板信息 */
  updateWaylineTemplateInfo: (
    waylineTemplateInfo: StateType['waylineTemplateInfo'],
  ) => void
  /** 更新航线配置信息 */
  updateWaylineConfig: (waylineConfig: StateType['waylineConfig']) => void
  /** 更新航点配置信息 */
  updateWaypointsConfig: (waypointsConfig: StateType['waypointsConfig']) => void
  /** 更新当前航点索引 */
  updateCurrentIndex: (currentIndex: StateType['currentIndex']) => void
  /** 更新当前动作索引 */
  updateCurrentActionIndex: (
    currentActionIndex: StateType['currentActionIndex'],
  ) => void
  /** 跳转至下一个航点 */
  nextWaypoint: () => void
  /** 跳转至上一个航点 */
  prevWaypoint: () => void
  /** 添加航点 */
  addWaypoint: (data: Partial<PointCloud3DWaypointConfigType>) => void
  /** 插入航点 */
  insertWaypoint: (
    data: Partial<PointCloud3DWaypointConfigType>,
    index: number,
  ) => void
  /** 更新当前航点 */
  updateCurrentWaypoint: (
    currentWaypoint: Partial<PointCloud3DWaypointConfigType>,
  ) => void
  /** 删除航点 */
  deleteWaypoint: (index: number) => void
}

const initialState = () =>
  ({
    open: false,
    isDrawHome: false,
    isDrawPoint: false,
    isMovePoint: false,
    spaceMapUrl: '',
    waylineTemplateInfo: {},
    waylineConfig: {
      speed: 1,
      obstacleMode: 0,
    },
    waypointsConfig: [],
    currentIndex: 0,
    currentActionIndex: 0,
  } as StateType)

const usePointCloud3DWaylineStore = create<StateType & ActionsType>()(
  (set, get) => ({
    ...initialState(),
    resetState: () => {
      set(initialState())
    },
    updateSpaceMapUrl: (spaceMapUrl) => {
      set({ spaceMapUrl })
    },
    updateIsDrawPoint: (isDrawPoint) => {
      set({ isDrawPoint })
    },
    updateIsMovePoint: (isMovePoint) => {
      set({ isMovePoint })
    },
    updateWaylineTemplateInfo: (waylineTemplateInfo) => {
      set({ waylineTemplateInfo })
    },
    updateWaylineConfig: (waylineConfig) => {
      set({ waylineConfig })
    },
    updateWaypointsConfig: (waypointsConfig) => {
      set({ waypointsConfig })
    },
    updateCurrentIndex: (currentIndex) => {
      set({ currentIndex })
    },
    updateCurrentActionIndex: (currentActionIndex) => {
      set({ currentActionIndex })
    },
    nextWaypoint: () => {
      const currentIndex =
        (get().currentIndex + 1) % get().waypointsConfig.length
      set({ currentIndex })
    },
    prevWaypoint: () => {
      let { currentIndex } = get()
      const { waypointsConfig } = get()
      currentIndex =
        (currentIndex - 1 + waypointsConfig.length) % waypointsConfig.length
      set({ currentIndex })
    },
    addWaypoint: (data) => {
      const { waypointsConfig, waylineConfig } = get()
      const newPoint: PointCloud3DWaypointConfigType = {
        positionIndex: waypointsConfig.length,
        positionName: `${waypointsConfig.length + 1}号点`,
        actions: [],
        x: 0,
        y: 0,
        z: waylineConfig.speed || 0,
        q_x: 0,
        q_y: 0,
        q_z: 0,
        q_w: 1,
        xid: v4(),
        ...data,
      }
      set({
        waypointsConfig: [...waypointsConfig, newPoint],
        currentIndex: waypointsConfig.length,
      })
    },
    insertWaypoint: (data, index) => {
      let { waypointsConfig } = get()
      const { waylineConfig } = get()
      // 越界检查
      if (index < 0 || index > waypointsConfig.length) {
        return
      }
      const newPoint: PointCloud3DWaypointConfigType = {
        positionIndex: index,
        positionName: `${index + 1}`,
        actions: [],
        x: 0,
        y: 0,
        z: waylineConfig.speed || 0,
        q_x: 0,
        q_y: 0,
        q_z: 0,
        q_w: 1,
        xid: v4(),
        ...data,
      }
      waypointsConfig = [
        ...waypointsConfig.slice(0, index),
        newPoint,
        ...waypointsConfig.slice(index).map((e) => ({
          ...e,
          positionIndex: e.positionIndex + 1,
        })),
      ]
      set({
        waypointsConfig,
        currentIndex: index,
      })
    },
    updateCurrentWaypoint: (data) => {
      let { waypointsConfig } = get()
      const { currentIndex } = get()
      waypointsConfig[currentIndex] = {
        ...waypointsConfig[currentIndex],
        ...data,
      }
      waypointsConfig = [...waypointsConfig]
      set({ waypointsConfig })
    },
    deleteWaypoint: (idx) => {
      let { waypointsConfig, currentIndex } = get()
      waypointsConfig.splice(idx, 1)
      waypointsConfig = [...waypointsConfig]
      currentIndex = limitNum(currentIndex, 0, waypointsConfig.length - 1)
      set({ waypointsConfig, currentIndex })
    },
  }),
)

export default usePointCloud3DWaylineStore
