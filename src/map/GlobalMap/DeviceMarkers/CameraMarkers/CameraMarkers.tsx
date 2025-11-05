import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import useDeviceFilterConfigStore from '@/store/useDeviceFilterConfig.store'
import { useShallow } from 'zustand/react/shallow'
import CameraMarkerWrapper from './CameraMarkerWrapper'

type PropsType = unknown

const CameraMarkers: FC<PropsType> = memo(() => {
  const cameraDevices = useMapDevicesStore((s) => s.cameraDevices)

  const filterConfig = useDeviceFilterConfigStore(
    useShallow((s) => ({
      isOnline: s.isOnline,
      isNotTask: s.isNotTask,
      isTask: s.isTask,
      hiddenDeviceIds: s.hiddenDeviceIds,
    })),
  )

  const { viewer } = useCesium()
  const [dataSource, setDataSource] = useState<Cesium.CustomDataSource | null>()

  useEffect(() => {
    if (!viewer || !cameraDevices.length) {
      return
    }
    const dataSource = new Cesium.CustomDataSource('cameraMarkers')
    viewer.dataSources.add(dataSource)

    // 开启聚合
    dataSource.clustering.enabled = true
    dataSource.clustering.pixelRange = 4 // 聚合像素范围
    dataSource.clustering.minimumClusterSize = 2 // 至少多少个点聚合

    dataSource.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) => {
        cluster.billboard.show = true
        cluster.billboard.image = '/images/marker/icon/camera.svg'
        cluster.billboard.width = 24
        cluster.billboard.height = 24
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY

        cluster.label.show = true
        cluster.label.text = `x ${clusteredEntities.length.toString()}`
        cluster.label.font = '12px sans-serif'
        cluster.label.fillColor = Cesium.Color.WHITE
        cluster.label.outlineColor = Cesium.Color.BLACK
        cluster.label.outlineWidth = 2
        cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE
        cluster.label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
        cluster.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER

        cluster.label.pixelOffset = new Cesium.Cartesian2(0, 24)

        cluster.billboard.id = `deviceCluster(${clusteredEntities
          /** @ts-ignore */
          .map((e) => e._id)
          .join(';')})`
      },
    )
    setDataSource(dataSource)

    return () => {
      attempt(() => {
        viewer.dataSources.remove(dataSource)
      })
    }
  }, [viewer, cameraDevices, filterConfig])

  const cameraInDetail = useMapDevicesStore((s) => s.cameraInDetail)

  if (!dataSource) {
    return
  }

  return cameraDevices
    .filter((e) => e.longitude && e.latitude)
    .map((e) => (
      <CameraMarkerWrapper
        key={e.deviceId}
        dataSource={dataSource}
        data={e}
        isDetail={cameraInDetail.has(e.deviceId)}
        filterConfig={filterConfig}
      />
    ))
})

CameraMarkers.displayName = 'CameraMarkers'

export default CameraMarkers
