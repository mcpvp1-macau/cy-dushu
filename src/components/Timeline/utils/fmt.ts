import { Dayjs } from 'dayjs'

export type DayjsInstance = InstanceType<typeof Dayjs>

export const fmtCurrentTime = (time: Date | DayjsInstance) => {
  if (time instanceof Date) {
    time = dayjs(time)
  }
  return time.format('M-D HH:mm:ss')
}
