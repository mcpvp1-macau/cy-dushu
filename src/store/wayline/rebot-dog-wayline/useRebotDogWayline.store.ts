import { create } from 'zustand'
import { limitNum } from '@/utils/math'
import { RebotDogWaylineConfigType, RebotDogWaypointConfigType } from './types'
import { WaylineTemplateType } from '../uav-airline/types'
import { v4 } from 'uuid'

type StateType = {
  open: boolean
  isDrawHome: boolean
  isDrawPoint: boolean
  waylineTemplateInfo: WaylineTemplateType
  waylineConfig: RebotDogWaylineConfigType
  waypointsConfig: RebotDogWaypointConfigType[]
  currentIndex: number
  currentActionIndex: number
}

type ActionsType = {
  /** 重置 store */
  resetState: () => void
  /** 开启航线编辑 */
  updateOpen: (open: StateType['open']) => void
  /** 设置是否在绘制起飞点 */
  updateIsDrawHome: (isDrawHome: StateType['isDrawHome']) => void
  /** 设置是否在绘制航点 */
  updateIsDrawPoint: (isDrawPoint: StateType['isDrawPoint']) => void
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
  addWaypoint: (data: Partial<RebotDogWaypointConfigType>) => void
  /** 插入航点 */
  insertWaypoint: (
    data: Partial<RebotDogWaypointConfigType>,
    index: number,
  ) => void
  /** 更新当前航点 */
  updateCurrentWaypoint: (
    currentWaypoint: Partial<RebotDogWaypointConfigType>,
  ) => void
  /** 删除航点 */
  deleteWaypoint: (index: number) => void
}

const initialState = () =>
  ({
    open: false,
    isDrawHome: false,
    isDrawPoint: false,
    waylineTemplateInfo: {},
    waylineConfig: {
      speed: 1,
    },
    waypointsConfig: [],
    currentIndex: 0,
    currentActionIndex: 0,
  } as StateType)

const useRebotDogWaylineStore = create<StateType & ActionsType>()(
  (set, get) => ({
    ...initialState(),
    resetState: () => {
      set(initialState())
    },
    updateOpen: (open) => {
      set({ open })
    },
    updateIsDrawHome: (isDrawHome) => {
      set({ isDrawHome })
    },
    updateIsDrawPoint: (isDrawPoint) => {
      set({ isDrawPoint })
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
      const newPoint: RebotDogWaypointConfigType = {
        positionIndex: waypointsConfig.length,
        positionName: `${waypointsConfig.length + 1}号点`,
        actions: [],
        pointX: 0,
        pointY: 0,
        pointZ: waylineConfig.speed || 100,
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
      const newPoint: RebotDogWaypointConfigType = {
        positionIndex: index,
        positionName: `${index + 1}`,
        actions: [],
        pointX: 0,
        pointY: 0,
        pointZ: waylineConfig.speed || 100,
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

export default useRebotDogWaylineStore
