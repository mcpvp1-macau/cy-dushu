import { ReactNode } from 'react'

export interface Btn {
  value: {
    x?: number
    y?: number
    /** 转头 */
    yaw?: number
    /** 低抬头 */
    pitch?: number
    /** 歪头 */
    roll?: number
  }
  identifier: 'x' | 'y' | 'yaw' | 'pitch' | 'roll'
  btn: string
  icon: ReactNode
  method: 'service.moveDog.post'
  label: string
}
