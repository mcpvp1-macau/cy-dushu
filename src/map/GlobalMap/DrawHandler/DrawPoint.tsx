import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean } from 'ahooks'
import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { createOverlay } from '@/service/modules/layer_overlay'
import { hexToARGB } from '@/utils/color'
import AddFormModal from './components/AddFormModal'

type PropsType = {
  onSuccess?: () => void
}

/** 打点 */
const DrawPoint: FC<PropsType> = memo(({ onSuccess }) => {
  const { t } = useTranslation()
  const { viewer } = useCesium()

  const pointRef = useRef<[number, number] | null>(null)
  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)

      pointRef.current = [geo[0], geo[1]]
      setTrue()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    const colorRGBA = hexToARGB(drawingColor)
    const postData = {
      ...data,
      overlayType: 'POSITION',
      overlayPositions: JSON.stringify([pointRef.current ?? []]),
      overlayBindType: 'NORMAL',
      overlayStyleConfig: JSON.stringify({
        contact: {
          '-callsign': data.overlayName,
        },
        color: {
          '-argb': colorRGBA,
          hex: drawingColor,
        },
        usericon: {
          '-iconsetpath': 'COT_MAPPING_SPOTMAP/b-m-p-s-m/' + colorRGBA,
        },
        precisionlocation: {
          '-altsrc': 'DTED0', //DTED0分辨率为900米；DTED1分辨率为90米；DTED2分辨率为30米,DTED3分辨率为12米
        },
        targetMunitions: {
          '-munitionVisibility': 'false', //目标弹药是否可见
        },
        remarks: '',
      }),
      cotType: CotType.POINT,
    }
    await createOverlay(postData)
    onSuccess?.()
    setFalse()
  }

  return (
    <>
      <AddFormModal
        title={t('overlay.marker.create.title')}
        open={open}
        onClose={setFalse}
        onConfirm={handleConfirm}
      />
    </>
  )
})

DrawPoint.displayName = 'DrawPoint'

export default DrawPoint
