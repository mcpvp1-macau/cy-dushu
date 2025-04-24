import { useDeepCompareEffect, useRafInterval } from 'ahooks'
import { useCesium } from 'resium'
import { penddingAbortControllers } from './CustomUrlTemplateImageryProvider'

type PropsType = unknown

const ImageryCancelAborter: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  const [tiles, setTiles] = useState<number[][]>([])

  useRafInterval(() => {
    const globe = viewer?.scene.globe
    if (!globe) {
      return
    }

    // @ts-ignore
    const tilesToRender = globe._surface?._tilesToRender as {
      x: number
      y: number
      level: number
    }[]
    if (!tilesToRender) {
      return
    }

    setTiles(tilesToRender.map((t) => [t.x, t.y, t.level]))
  }, 100)

  useDeepCompareEffect(() => {
    console.log('tiles', tiles)
    const set = new Set(tiles.map((t) => t.join('-')))
    penddingAbortControllers.forEach((c) => {
      if (!set.has(c[0].join('-'))) {
        c[1].abort()
      }
    })
  }, [tiles])

  return null
})

ImageryCancelAborter.displayName = 'ImageryCancelAborter'

export default ImageryCancelAborter
