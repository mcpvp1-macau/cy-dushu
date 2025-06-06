import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'

const RIDTargets = lazy(() => import('./RIDTargets'))
const AllTargets = lazy(() => import('./AllTargets/AllTargets'))

type PropsType = unknown

/** 城市态势相关业务 */
const CitySituation: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()

  const ridsStr = searchParams.get('rids')
  const cityAllTargets =
    searchParams.get('cityAllTargets')?.toLowerCase() === 'true'
  const rids = ridsStr ? ridsStr.split(',') : []

  return (
    <Suspense fallback={null}>
      {rids.length > 0 && <RIDTargets targetIds={rids} />}
      {cityAllTargets && <AllTargets />}
    </Suspense>
  )
})

CitySituation.displayName = 'CitySituation'

export default CitySituation
