import mitt from 'mitt'
import { useCesium } from 'resium'

type PropsType = unknown

export const mapViewSaveEmitter = mitt<{
  save: undefined
}>()
//
/** 地图视角保存和初始化 */
const MapViewSave: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  useEffect(() => {
    const view = localStorage.getItem('map-view')
    if (!view || !viewer) {
      return
    }
    try {
      const { position, heading, pitch, roll } = JSON.parse(view)
      viewer.camera.setView({
        destination: position,
        orientation: {
          heading,
          pitch,
          roll,
        },
      })
    } catch (e) {
      console.error(e)
    }
  }, [viewer])

  useEffect(() => {
    const fn = () => {
      if (!viewer) {
        return
      }
      const camera = viewer.camera
      const view = {
        position: camera.position,
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      }
      localStorage.setItem('map-view', JSON.stringify(view))
    }
    mapViewSaveEmitter.on('save', fn)
    return () => {
      mapViewSaveEmitter.off('save', fn)
    }
  }, [])

  return null
})

MapViewSave.displayName = 'MapViewSave'

export default MapViewSave
