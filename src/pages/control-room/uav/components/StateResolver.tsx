import { memo, type FC } from 'react'
import useCollectHistoryPath from '../hooks/useCollectHisotryPath'

type PropsType = unknown

/** 状态处理相关 */
const StateResolver: FC<PropsType> = memo(() => {
  useCollectHistoryPath(64)
  return null
})

StateResolver.displayName = 'StateResolver'

export default StateResolver
