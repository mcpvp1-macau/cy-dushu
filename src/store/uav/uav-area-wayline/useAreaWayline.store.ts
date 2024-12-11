import { create } from 'zustand'
import { AirlineConfigType, AirlineTemplateType } from '../uav-airline/types'
import { createInitAirlineConfig } from '../uav-airline/helper'

type StateType = {
  open: boolean
  airlineConfig: AirlineConfigType
  templateConfig: AirlineTemplateType
  isDrawHome: boolean
}

type ActionsType = {
  updateOpen: (open: StateType['open']) => void
  updateAirlineConfig: (config: Partial<AirlineConfigType>) => void
  updateTemplateConfig: (config: Partial<AirlineTemplateType>) => void
  updateIsDrawHome: (isDrawHome: StateType['isDrawHome']) => void
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
  },
  isDrawHome: false,
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
}))

export default useAreaWaylineStore
