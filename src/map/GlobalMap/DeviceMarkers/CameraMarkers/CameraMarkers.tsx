import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

const CameraMarkers: FC<PropsType> = memo(() => {
  const cameraDevices = useMapDevicesStore((s) => s.cameraDevices)

  const listConfig = useDeviceListConfigStore(
    useShallow((s) => ({
      isOnline: s.isOnline,
      isNotTask: s.isNotTask,
      isTask: s.isTask,
      hiddenDeviceIds: s.hiddenDeviceIds,
    })),
  )

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !cameraDevices.length) {
      return
    }
    const dataSource = new Cesium.CustomDataSource('cameraMarkers')
    viewer.dataSources.add(dataSource)

    cameraDevices.forEach((device) => {
      if (!device.longitude || !device.latitude) {
        return
      }

      // 过滤隐藏设备
      if (listConfig.hiddenDeviceIds[device.deviceId]) {
        return
      }
      // 过滤在线离线
      if (listConfig.isOnline && device.status !== 'ONLINE') {
        return
      }

      dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          device.longitude,
          device.latitude,
          device.altitude || 0,
        ),
        id: `device--CAMERA--${device.deviceName}--${device.deviceId}--${device.longitude}--${device.latitude}`,
        billboard: {
          image: '/images/marker/icon/camera.svg',
          width: 24,
          height: 24,
        },
        label: {
          text: device.deviceName,
          font: '12px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, 36),
        },
      })
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
    })

    return () => {
      attempt(() => {
        viewer.dataSources.remove(dataSource)
      })
    }
  }, [viewer, cameraDevices, listConfig])

  return null
})

CameraMarkers.displayName = 'CameraMarkers'

export default CameraMarkers
