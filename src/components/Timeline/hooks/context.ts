import { createContext } from 'react'
import { Timeline, DataSet } from 'vis-timeline/standalone'

const TimelineContext = createContext<{
  timeline: InstanceType<typeof Timeline> | null
  dataSets: InstanceType<typeof DataSet> | null
}>({ timeline: null, dataSets: null })

export default TimelineContext
