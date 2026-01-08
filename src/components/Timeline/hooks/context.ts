import { createContext } from 'react'
import type {
  DataSetDataGroup,
  DataSetDataItem,
  Timeline,
} from 'vis-timeline/standalone'

const TimelineContext = createContext<{
  timeline: Timeline | null
  dataSets: DataSetDataItem | null
  groupSets: DataSetDataGroup | null
}>({ timeline: null, dataSets: null, groupSets: null })

export const useTimeline = () => {
  return useContext(TimelineContext)
}

export default TimelineContext
