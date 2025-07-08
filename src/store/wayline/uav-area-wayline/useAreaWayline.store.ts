import { create } from 'zustand'
import {
  AirlineConfigType,
  AirlinePoint,
  WaylineTemplateType,
} from '../uav-airline/types'
import { createInitAirlineConfig } from '../uav-airline/helper'

type StateType = {
  open: boolean
  airlineConfig: AirlineConfigType
  airpointsConfig: AirlinePoint[]
  templateConfig: WaylineTemplateType & {
    polygon: number[][] | null
    mainK: number
    interval: number
    coverage: number
    photoWaylineCoverage: number
  }
  isDrawHome: boolean
  cameraInfo: {
    focal: number
    sensorWidth: number
    sensorHeight: number
  }
  firstAirpoint: AirlinePoint | null
}

type ActionsType = {
  reset: () => void
  updateOpen: (open: StateType['open']) => void
  updateAirlineConfig: (config: Partial<AirlineConfigType>) => void
  updateTemplateConfig: (config: Partial<WaylineTemplateType>) => void
  updateCameraInfo: (config: StateType['cameraInfo']) => void
  updateIsDrawHome: (isDrawHome: StateType['isDrawHome']) => void
  updateAirpointsConfig: (config: AirlinePoint[]) => void
  updateFirstAirpoint: (airpoint: AirlinePoint) => void
}

const createInitialState = (): StateType => ({
  open: false,
  airlineConfig: {
    ...createInitAirlineConfig(),
    globalWaypointTurnMode: 'toPointAndPassWithContinuityCurvature',
    height: 140.6,
  },
  templateConfig: {
    waylineTemplateId: 0,
    taskName: '',
    templateId: '',
    smartTaskType: '',
    defaultDeviceId: '',
    pilotCode: '',
    actionId: '',
    deviceId: '',
    polygon: null,
    mainK: 0,
    interval: 0,
    coverage: 10,
    wideGSD: 5,
    photoWaylineCoverage: 0.7,
  },
  isDrawHome: false,
  cameraInfo: {
    focal: 24,
    sensorWidth: 40,
    sensorHeight: 30,
  },
  airpointsConfig: [],
  firstAirpoint: null,
})

const useAreaWaylineStore = create<StateType & ActionsType>()((set) => ({
  ...createInitialState(),
  reset: () => {
    set(createInitialState())
  },
  updateOpen: (open) => {
    set({ open }, false)
  },
  updateAirlineConfig: (config) => {
    set(
      (state) => ({
        airlineConfig: {
          ...state.airlineConfig,
          ...config,
        },
      }),
      false,
    )
  },
  updateTemplateConfig: (config) => {
    set(
      (state) => ({
        templateConfig: {
          ...state.templateConfig,
          ...config,
        },
      }),
      false,
    )
  },
  updateCameraInfo: (config) => {
    set({ cameraInfo: config }, false)
  },
  updateIsDrawHome: (isDrawHome) => {
    set({ isDrawHome }, false)
  },
  updateAirpointsConfig: (airpoints) => {
    set({ airpointsConfig: airpoints }, false)
  },
  updateFirstAirpoint: (airpoint) => {
    set({ firstAirpoint: airpoint }, false)
  },
}))

export default useAreaWaylineStore
