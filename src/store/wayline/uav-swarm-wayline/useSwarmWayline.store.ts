import { create } from 'zustand'
import { AirlineConfigType, AirlineTemplateType } from '../uav-airline/types'
import { createInitAirlineConfig } from '../uav-airline/helper'

type StateType = {
  open: boolean
  airlineConfig: AirlineConfigType
  templateConfig: AirlineTemplateType & {
    polygon: number[][] | null
    mainK: number
    interval: number
    coverage: number
  }
}

type ActionsType = {
  reset: () => void
  updateOpen: (open: StateType['open']) => void
  updateAirlineConfig: (config: Partial<AirlineConfigType>) => void
  updateTemplateConfig: (config: Partial<AirlineTemplateType>) => void
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
})

/** 蜂群航线 */
const useSwarmWaylineStore = create<StateType & ActionsType>()((set) => ({
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
}))

export default useSwarmWaylineStore
