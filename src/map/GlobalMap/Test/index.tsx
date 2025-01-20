import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Slider } from 'antd'
import { pixelToGps } from '@/utils/geo/geo-pixel'

type PropsType = unknown

const MapTest: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  const [heading, setHeading] = useState(0)
  const [pitch, setPitch] = useState(0)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const res = pixelToGps(
      960,
      720,
      1920,
      1440,
      [30.271968841552734, 119.95597839355469, 62.5],
      [0.0, -90.0, 154.6999969482422],
    )

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(res[1], res[0], 0),
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    })

    return () => {
      // viewer.entities.remove(origin)
      // dest && viewer.entities.remove(dest)
      viewer.entities.removeAll()
    }
  }, [viewer, heading, pitch])

  return (
    <div className="fixed right-0 top-10 w-96 bg-ground-3 bg-opacity-80 p-3">
      Heading:{' '}
      <Slider min={0} max={360} value={heading} onChange={setHeading} />
      Pitch: <Slider min={-90} max={90} value={pitch} onChange={setPitch} />
      {/* Roll: */}
      {/* <Slider min={-180} max={180} value={roll} onChange={setRoll} /> */}
    </div>
  )
})

MapTest.displayName = 'MapTest'

export default MapTest
