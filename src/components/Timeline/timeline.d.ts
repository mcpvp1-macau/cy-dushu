// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Timeline } from 'vis-timeline/standalone'

declare module 'vis-timeline/standalone' {
  interface Timeline {
    setCustomTimeMarker: (date: string, id: string) => void
  }
}
