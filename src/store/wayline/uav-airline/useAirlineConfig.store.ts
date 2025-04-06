import { create } from 'zustand'
import {
  AirlineConfigType,
  WaylineTemplateType,
  AirpointsConfigItem,
} from './types'
import { devtools } from 'zustand/middleware'
import { limitNum } from '@/utils/math'
import * as turf from '@turf/turf'
import { createComputed } from 'zustand-computed'
import { createInitAirlineConfig, createInitAirpointConfig } from './helper'

type StateType = {
  open: boolean
  isDrawHome: boolean
  isDrawPoint: boolean
  airlineTemplateInfo: WaylineTemplateType
  airlineConfig: AirlineConfigType
  airpointsConfig: AirpointsConfigItem[]
  currentIndex: number
  currentActionIndex: number
  uav: AirpointsConfigItem
  cameraInfo: {
    focal: number
    sensorWidth: number
    sensorHeight: number
  } | null
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
  updateAirlineTemplateInfo: (
    airlineTemplateInfo: StateType['airlineTemplateInfo'],
  ) => void
  /** 更新航线配置信息 */
  updateAirlineConfig: (airlineConfig: StateType['airlineConfig']) => void
  /** 更新航点配置信息 */
  updateAirpointsConfig: (airpointsConfig: StateType['airpointsConfig']) => void
  /** 更新当前航点索引 */
  updateCurrentIndex: (currentIndex: StateType['currentIndex']) => void
  /** 更新当前动作索引 */
  updateCurrentActionIndex: (
    currentActionIndex: StateType['currentActionIndex'],
  ) => void
  /** 跳转至下一个航点 */
  nextAirPoint: () => void
  /** 跳转至上一个航点 */
  prevAirPoint: () => void
  /** 添加航点 */
  addAirPoint: (data: Partial<AirpointsConfigItem>) => void
  /** 插入航点 */
  insertAirPoint: (data: Partial<AirpointsConfigItem>, index: number) => void
  /** 更新当前航点 */
  updateCurrentAirpoint: (currentAirPoint: Partial<AirpointsConfigItem>) => void
  /** 删除航点 */
  delteAirPoint: (index: number) => void
  /** 更新无人机配置 */
  updateUav: (uav: Partial<AirpointsConfigItem>) => void
  /** 根据当前航点计算无人机配置 */
  calcUavByCurrentAirpoint: () => void
  updateCameraInfo: (cameraInfo: StateType['cameraInfo']) => void
}

const initialState = () =>
  ({
    open: false,
    isDrawHome: false,
    isDrawPoint: false,
    airlineTemplateInfo: {},
    airlineConfig: createInitAirlineConfig(),
    airpointsConfig: [],
    currentIndex: 0,
    currentAirPoint: {},
    currentActionIndex: 0,
    uav: createInitAirpointConfig(0),
    cameraInfo: null,
  } as StateType)

const computedState = createComputed((state: StateType & ActionsType) => {
  const { airlineConfig, airpointsConfig, currentIndex, currentActionIndex } =
    state
  if (airpointsConfig.length === 0) {
    return {
      bearing: 0,
      eoBearingDealta: 0,
      eoPitch: 0,
      fovMultipiler: 5,
    }
  }
  const { takeOffRefPoint } = airlineConfig
  let prev = takeOffRefPoint
  // 计算偏航角
  let bearing = 0
  if (airlineConfig.waypointHeadingMode === 'followWayline') {
    if (currentIndex > 0) {
      const p = airpointsConfig[currentIndex - 1]
      prev = [p.pointX, p.pointY]
    }
    if (Array.isArray(prev) && prev.length >= 2) {
      bearing = turf.bearing(
        turf.point([prev[0], prev[1]]),
        turf.point([
          airpointsConfig[currentIndex].pointX,
          airpointsConfig[currentIndex].pointY,
        ]),
      )
    }
  }
  // 计算云台偏航角差值
  let eoBearingDealta = 0
  let eoPitch = 0
  let fovMultipiler = 5

  // 遍历 currentIndex 之前所有的航点
  for (let i = 0; i < currentIndex; i++) {
    prev =
      i > 0
        ? [airpointsConfig[i - 1].pointX, airpointsConfig[i - 1].pointY]
        : takeOffRefPoint!
    // 此处需要记录当前航点动作前的偏航角
    let b =
      airlineConfig.waypointHeadingMode === 'followWayline'
        ? turf.bearing(
            turf.point([prev[0], prev[1]]),
            turf.point([
              airpointsConfig[i].pointX!,
              airpointsConfig[i].pointY!,
            ]),
          )
        : 0
    for (const action of airpointsConfig[i].actions!) {
      if (action.type === 'ROTATE_YAW') {
        // 若有偏航角动作，则使用动作前的偏航角
        b = action.config.aircraftHeading ?? b
      } else if (action.type === 'CAMERA_POSITION') {
        if (action.config.x !== undefined) {
          eoBearingDealta = action.config.x - b
        }
        eoPitch = action.config.y ?? eoPitch
      } else if (action.type === 'ZOOM') {
        fovMultipiler = action.config.focalLength
      }
    }
  }
  // 遍历当前航点的动作
  if ((airpointsConfig[currentIndex]?.actions?.length ?? 0) > 0) {
    const c = airpointsConfig[currentIndex]
    for (let i = 0; i <= currentActionIndex; i++) {
      const action = c.actions![i]
      if (!action) {
        continue
      }
      if (action.type === 'ROTATE_YAW') {
        // 若有偏航角动作，则使用动作前的偏航角
        bearing = action.config.aircraftHeading ?? bearing
      } else if (action.type === 'CAMERA_POSITION') {
        // 若有偏航角动作，则使用动作前的偏航角
        if (action.config.x !== undefined) {
          eoBearingDealta = action.config.x - bearing
        }
        eoPitch = action.config.y ?? eoPitch
      } else if (action.type === 'ZOOM') {
        // 若有变焦动作，则使用动作前的变焦倍数
        fovMultipiler = action.config.focalLength
      }
    }
  }
  return { bearing, eoBearingDealta, eoPitch, fovMultipiler }
})

const useAirlineConfigStore = create<
  StateType & ActionsType & Partial<ReturnType<typeof computedState>>
>()(
  devtools(
    computedState((set, get) => ({
      ...initialState(),
      resetState: () => {
        set(initialState(), false, 'resetState')
      },
      updateOpen: (open) => {
        set({ open }, false, 'updateOpen')
      },
      updateIsDrawHome: (isDrawHome) => {
        set({ isDrawHome }, false, 'updateIsDrawHome')
      },
      updateIsDrawPoint: (isDrawPoint) => {
        set({ isDrawPoint }, false, 'updateIsDrawPoint')
      },
      updateAirlineTemplateInfo: (airlineTemplateInfo) => {
        set({ airlineTemplateInfo }, false, 'updateAirlineTemplateInfo')
      },
      updateAirlineConfig: (airlineConfig) => {
        set({ airlineConfig }, false, 'updateAirlineConfig')
      },
      updateAirpointsConfig: (airpointsConfig) => {
        set({ airpointsConfig }, false, 'updateAirpointsConfig')
      },
      updateCurrentIndex: (currentIndex) => {
        set({ currentIndex }, false, 'updateCurrentIndex')
      },
      updateCurrentActionIndex: (currentActionIndex) => {
        set({ currentActionIndex }, false, 'updateCurrentActionIndex')
      },
      nextAirPoint: () => {
        const currentIndex =
          (get().currentIndex + 1) % get().airpointsConfig.length
        set({ currentIndex }, false, 'nextAirPoint')
      },
      prevAirPoint: () => {
        let { currentIndex } = get()
        const { airpointsConfig } = get()
        currentIndex =
          (currentIndex - 1 + airpointsConfig.length) % airpointsConfig.length
        set({ currentIndex }, false, 'prevAirPoint')
      },
      addAirPoint: (data) => {
        const { airpointsConfig, airlineConfig } = get()
        data = {
          ...createInitAirpointConfig(airpointsConfig.length),
          ...data,
        }
        data.pointZ ||= airlineConfig.height || 100
        set(
          {
            airpointsConfig: [...airpointsConfig, data as AirpointsConfigItem],
            currentIndex: airpointsConfig.length,
          },
          false,
          'addAirPoint',
        )
      },
      insertAirPoint: (data, index) => {
        let { airpointsConfig } = get()
        const { airlineConfig } = get()
        // 越界检查
        if (index < 0 || index > airpointsConfig.length) {
          return
        }
        data = {
          ...createInitAirpointConfig(index),
          ...data,
        }
        data.pointZ ||= airlineConfig.height || 100
        airpointsConfig = [
          ...airpointsConfig.slice(0, index),
          data as AirpointsConfigItem,
          ...airpointsConfig.slice(index).map((e) => ({
            ...e,
            positionIndex: e.positionIndex! + 1,
          })),
        ]
        set(
          {
            airpointsConfig,
            currentIndex: index,
          },
          false,
          'insertAirPoint',
        )
      },
      updateCurrentAirpoint: (data) => {
        let { airpointsConfig } = get()
        const { currentIndex } = get()
        airpointsConfig[currentIndex] = {
          ...airpointsConfig[currentIndex],
          ...data,
        }
        airpointsConfig = [...airpointsConfig]
        set({ airpointsConfig }, false, 'updateCurrentAirpoint')
      },
      delteAirPoint: (idx) => {
        let { airpointsConfig, currentIndex } = get()
        airpointsConfig.splice(idx, 1)
        airpointsConfig = [...airpointsConfig]
        currentIndex = limitNum(currentIndex, 0, airpointsConfig.length - 1)
        set({ airpointsConfig, currentIndex }, false, 'delteAirPoint')
      },
      updateUav: (data) => {
        let { uav } = get()
        uav = { ...uav, ...data }
        set({ uav }, false, 'updateUav')
      },
      calcUavByCurrentAirpoint: () => {
        const currentAirPoint = get().airpointsConfig[get().currentIndex]
        const {
          airpointsConfig,
          currentIndex,
          currentActionIndex,
          airlineConfig,
          bearing: currentBearing,
          eoBearingDealta: eoBearingDelta,
          eoPitch,
          fovMultipiler,
        } = get()
        const takeOffRefPoint = airlineConfig.takeOffRefPoint
        const deltaHeight = takeOffRefPoint?.[2] ?? 0

        const nextUav = {
          ...(currentAirPoint ?? { pointX: 0, pointY: 0, pointZ: 0 }),
          uavHeading: currentBearing,
          eoHeading: currentBearing + eoBearingDelta,
          eoPitch: eoPitch,
          eoFovMultiplier: fovMultipiler,
        }
        if (airpointsConfig.length === 0 && takeOffRefPoint) {
          nextUav.pointX = takeOffRefPoint[0]
          nextUav.pointY = takeOffRefPoint[1]
          nextUav.pointZ = airlineConfig.takeOffSecurityHeight + deltaHeight
          set({
            uav: nextUav,
          })
          return
        }
        nextUav.pointZ += deltaHeight
        const c = airpointsConfig[currentIndex]
        if (
          !c ||
          !c.actions ||
          !Array.isArray(c.actions) ||
          c.actions.length === 0
        ) {
          set({
            uav: nextUav,
          })
          return
        }
        for (let i = 0; i <= currentActionIndex; i++) {
          const action = c.actions[i]
          if (!action) {
            continue
          }
          // 无人机的偏航角
          if (action.type === 'ROTATE_YAW') {
            nextUav.uavHeading =
              action.config.aircraftHeading ?? nextUav.uavHeading
          }
          // 云台角度
          if (action.type === 'CAMERA_POSITION') {
            nextUav.eoHeading = action.config.x ?? nextUav.eoHeading
            nextUav.eoPitch = action.config.y ?? nextUav.eoPitch
            nextUav.eoRoll = action.config.roll ?? nextUav.eoRoll
          }
          if (action.type === 'ZOOM') {
            nextUav.eoFovMultiplier =
              action.config.focalLength ?? nextUav.eoFovMultiplier
          }
        }
        set({ uav: nextUav }, false, 'calcUavByCurrentAirpoint')
      },
      updateCameraInfo: (cameraInfo) => {
        set({ cameraInfo }, false, 'updateCameraInfo')
      },
    })),
    {
      name: 'airline-config-store',
      enabled: process.env.NODE_ENV === 'development' && true,
    },
  ),
)

export default useAirlineConfigStore
