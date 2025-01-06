import { create } from 'zustand'
import {
  AirlineConfigType,
  AirlinePoint,
  AirlineTemplateType,
} from '../uav-airline/types'
import { createInitAirlineConfig } from '../uav-airline/helper'

type StateType = {
  open: boolean
  airlineConfig: AirlineConfigType
  airpointsConfig: AirlinePoint[]
  templateConfig: AirlineTemplateType & {
    polygon: number[][] | null
    mainK: number
    interval: number
    coverage: number
  }
  isDrawHome: boolean
  cameraInfo: {
    focal: number
    sensorWidth: number
    sensorHeight: number
  }
}

type ActionsType = {
  updateOpen: (open: StateType['open']) => void
  updateAirlineConfig: (config: Partial<AirlineConfigType>) => void
  updateTemplateConfig: (config: Partial<AirlineTemplateType>) => void
  updateIsDrawHome: (isDrawHome: StateType['isDrawHome']) => void
  updateAirpointsConfig: (config: AirlinePoint[]) => void
}

const createInitialState = (): StateType => ({
  open: false,
  airlineConfig: {
    ...createInitAirlineConfig(),
    globalWaypointTurnMode: 'toPointAndPassWithContinuityCurvature',
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
  },
  isDrawHome: false,
  cameraInfo: {
    focal: 24,
    sensorWidth: 40,
    sensorHeight: 30,
  },
  airpointsConfig: [],
})

const useAreaWaylineStore = create<StateType & ActionsType>()((set) => ({
  ...createInitialState(),
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
  updateIsDrawHome: (isDrawHome) => {
    set({ isDrawHome }, false)
  },
  updateAirpointsConfig: (airpoints) => {
    set({ airpointsConfig: airpoints }, false)
  },
}))

export default useAreaWaylineStore
