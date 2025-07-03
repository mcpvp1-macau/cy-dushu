import H3Primitive from '@/map/CesiumMap/components/H3Primitive'
import useDensityMapStore from '@/store/map/useDensityMap.store'

type PropsType = unknown

const DensityMap: FC<PropsType> = memo(() => {
  // const { viewer } = useCesium()

  const historydensityMap = useDensityMapStore((s) => s.densityMap)
  const realDensityMap = useDensityMapStore((s) => s.realDensityMap)

  const densityMap = useMemo(() => {
    const densityMap = new Map<string, { h3Code: string; color: string }>()

    historydensityMap.forEach((item) => {
      densityMap.set(item.h3Code, {
        h3Code: item.h3Code,
        color: item.color,
      })
    })

    realDensityMap.forEach((item) => {
      densityMap.set(item.h3Code, {
        h3Code: item.h3Code,
        color: item.color,
      })
    })

    return densityMap
  }, [historydensityMap, realDensityMap])

  return Array.from(densityMap.values()).map((e) => (
    <H3Primitive key={e.h3Code} h3Code={e.h3Code} color={e.color} />
  ))
})

DensityMap.displayName = 'DensityMap'

export default DensityMap
