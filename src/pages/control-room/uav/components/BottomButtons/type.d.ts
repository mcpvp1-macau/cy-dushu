import { ReactNode } from 'react'

export interface Btn {
  value: {
    x?: number
    y?: number
    z?: number
    yaw?: number
    pitch?: number
    roll?: number
  }
  identifier: 'x' | 'y' | 'z' | 'yaw' | 'pitch' | 'roll'
  btn: string
  icon: ReactNode
  method: 'service.moveUav.post' | 'service.moveGimbal.post'
  label: string
}
