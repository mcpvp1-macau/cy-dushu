import useMixARStore from '@/store/control-room/useMixAR.store'
import useARSettingStore from '@/store/setting/useARSetting.store'
import * as Cesium from 'cesium'
import { Feature, Point, GeoJsonProperties } from 'geojson'
import { LabelLevelMap, LayerLevelMap, LabelRelateMap } from '../Enum'
import CollisionCheckLabelCollection, {
  ExtendLabel,
} from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import { getPOIIcon } from './icon-map'
import { attempt } from 'lodash'
import { ARSceneCesiumContext } from '../context'

const GeodataRender = () => {
  const { ocrc } = useContext(ARSceneCesiumContext)

  const aois = useMixARStore((s) => s.aois)
  const roads = useMixARStore((s) => s.roads)
  const pois = useMixARStore((s) => s.pois)
  const arSetting = useARSettingStore((s) => s)

  const preCollisionCheckHandler = useRef<
    ((labels: ExtendLabel[]) => void) | null
  >(null)
  const preLabelRef = useRef<ExtendLabel[]>([])

  useEffect(() => {
    const baseAoiPrimitiveCollection =
      ocrc!.orderPrimitives[LayerLevelMap.baseAoi]
    const buildingAoiPrimitiveCollection =
      ocrc!.orderPrimitives[LayerLevelMap.build]
    const roadPrimitiveCollection = ocrc!.orderPrimitives[LayerLevelMap.road]
    const labelCollection: CollisionCheckLabelCollection =
      ocrc!.orderPrimitives[LayerLevelMap.label].get(LabelRelateMap.label)
    const poiMarkerCollection: Cesium.BillboardCollection =
      ocrc!.orderPrimitives[LayerLevelMap.label].get(LabelRelateMap.poiMarker)
    labelCollection.renderCount = 0

    const attachmentPois: Feature<Point, GeoJsonProperties>[] = []
    if (arSetting.aoi.enable && aois) {
      const baseAoiFillInstances: Cesium.GeometryInstance[] = []
      const baseAoiOutlineInstances: Cesium.GeometryInstance[] = []
      const buildingAoiFillInstances: Cesium.GeometryInstance[] = []
      const buildingAoiOutlineInstances: Cesium.GeometryInstance[] = []
      // 遍历并组装instances
      for (const feature of aois.features) {
        // 建筑显隐逻辑
        const isBuilding = feature.properties?.['class'] === 'building'
        if (!arSetting.aoi.showBuilding && isBuilding) {
          continue
        }

        // 添加label
        if (arSetting.poi.showName && feature.properties?.name) {
          let min0 = Infinity
          let min1 = Infinity
          let max0 = -Infinity
          let max1 = -Infinity
          for (const p of feature.geometry.coordinates[0]) {
            min0 = Math.min(min0, p[0])
            min1 = Math.min(min1, p[1])
            max0 = Math.max(max0, p[0])
            max1 = Math.max(max1, p[1])
          }
          const p = [(min0 + max0) / 2, (min1 + max1) / 2]

          attachmentPois.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: p,
            },
            properties: {
              ...feature.properties,
              level: LabelLevelMap.aoi,
            },
          })
        }

        const positions: Cesium.Cartesian3[] = []
        for (const coordinates of feature.geometry.coordinates[0]) {
          const catesian = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            coordinates[2],
          )
          positions.push(catesian)
        }
        if (positions.length < 2) {
          continue
        }
        const fillGeometry = new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
            perPositionHeight: true,
          }),
        })
        const outlineGeometry = new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: arSetting.aoi.borderSize / window.devicePixelRatio,
          }),
        })

        if (isBuilding) {
          buildingAoiFillInstances.push(fillGeometry)
          buildingAoiOutlineInstances.push(outlineGeometry)
        } else {
          baseAoiFillInstances.push(fillGeometry)
          baseAoiOutlineInstances.push(outlineGeometry)
        }
      }

      const aoiFillPrimitive = new Cesium.Primitive({
        geometryInstances: baseAoiFillInstances,
        appearance: new Cesium.MaterialAppearance({
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(arSetting.aoi.color),
          }),
        }),
        asynchronous: false,
      })

      const aoiOutlinePrimitive = new Cesium.Primitive({
        geometryInstances: baseAoiOutlineInstances,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(arSetting.aoi.borderColor),
          }),
        }),
        asynchronous: false,
      })
      baseAoiPrimitiveCollection.add(aoiFillPrimitive)
      baseAoiPrimitiveCollection.add(aoiOutlinePrimitive)

      const buildingAoiFillPrimitive = new Cesium.Primitive({
        geometryInstances: buildingAoiFillInstances,
        appearance: new Cesium.MaterialAppearance({
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(arSetting.aoi.color),
          }),
        }),
        asynchronous: false,
      })
      const buildingAoiOutlinePrimitive = new Cesium.Primitive({
        geometryInstances: buildingAoiOutlineInstances,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString(arSetting.aoi.borderColor),
          }),
        }),
        asynchronous: false,
      })
      buildingAoiPrimitiveCollection.add(buildingAoiFillPrimitive)
      buildingAoiPrimitiveCollection.add(buildingAoiOutlinePrimitive)
    }

    if (roads) {
      const mainRoadInstances: Cesium.GeometryInstance[] = []
      const subRoadInstances: Cesium.GeometryInstance[] = []
      for (const feature of roads.features) {
        const isMain = !!feature.properties?.name
        if (
          (isMain && !arSetting.mainRoad.enable) ||
          (!isMain && !arSetting.subRoad.enable)
        ) {
          continue
        }

        const name = feature.properties?.name ?? feature.properties?.RoadName
        if (arSetting.poi.showName && name) {
          const p =
            feature.geometry.coordinates[
              feature.geometry.coordinates.length >> 1
            ]
          attachmentPois.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: p,
            },
            properties: {
              ...feature.properties,
              level: LabelLevelMap.road,
            },
          })
        }

        const positions: Cesium.Cartesian3[] = []
        for (const coordinates of feature.geometry.coordinates) {
          const catesian = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            coordinates[2] + 0.5 || 0.5,
          )
          // 获取屏幕坐标
          positions.push(catesian)
        }
        if (positions.length < 2) {
          continue
        }
        const geometryInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: isMain ? arSetting.mainRoad.size : arSetting.subRoad.size,
          }),
        })
        if (isMain) {
          mainRoadInstances.push(geometryInstance)
        } else {
          subRoadInstances.push(geometryInstance)
        }
      }

      const mainRoadPrimitive = new Cesium.Primitive({
        geometryInstances: mainRoadInstances,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('PolylineOutline', {
            color: Cesium.Color.fromCssColorString(arSetting.mainRoad.color),
            outlineColor: Cesium.Color.fromCssColorString(
              arSetting.mainRoad.borderColor,
            ),
            outlineWidth: arSetting.mainRoad.borderSize,
          }),
        }),
        asynchronous: false,
      })
      const subRoadPrimitive = new Cesium.Primitive({
        geometryInstances: subRoadInstances,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('PolylineOutline', {
            color: Cesium.Color.fromCssColorString(arSetting.subRoad.color),
            outlineColor: Cesium.Color.fromCssColorString(
              arSetting.subRoad.borderColor,
            ),
            outlineWidth: arSetting.subRoad.borderSize,
          }),
        }),
        asynchronous: false,
      })

      roadPrimitiveCollection.add(subRoadPrimitive)
      roadPrimitiveCollection.add(mainRoadPrimitive)
    }

    if (arSetting.text.enable) {
      const labelOptions = {
        font: `${Math.max(arSetting.text.size, 2)}px sans-serif`,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        fillColor: Cesium.Color.fromCssColorString(arSetting.text.color),
        outlineColor: Cesium.Color.fromCssColorString(
          arSetting.text.borderColor,
        ),
        outlineWidth: Math.max(arSetting.text.borderSize, 0),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      }

      const addedLabels: ExtendLabel[] = []
      if (arSetting.poi.enable && pois) {
        const poiFilter = new Set(arSetting.poi.filter)
        for (const feature of pois.features) {
          if (poiFilter.size && !poiFilter.has(feature.properties?.bigType)) {
            continue
          }

          if (feature.properties?.showName === false) {
            continue
          }

          const coordinate = feature.geometry.coordinates
          const position = Cesium.Cartesian3.fromDegrees(
            coordinate[0],
            coordinate[1],
            coordinate[2] ?? 0,
          )
          const label = feature.properties?.name
          addedLabels.push(
            labelCollection.add({
              show: false,
              data: feature.properties,
              id: 'poi' + label,
              position: position,
              text: label,
              level: LabelLevelMap.poi,
              pixelOffset: new Cesium.Cartesian2(0, 16),
              extendBounds: new Cesium.Cartesian2(0, 20),
              ...labelOptions,
            }),
          )
        }
      }
      for (const feature of attachmentPois) {
        const coordinate = feature.geometry.coordinates
        const position = Cesium.Cartesian3.fromDegrees(
          coordinate[0],
          coordinate[1],
          coordinate[2] ?? 0,
        )
        const label = feature.properties?.name
        const level = feature.properties?.level ?? 0
        addedLabels.push(
          labelCollection.add({
            show: false,
            id: 'attachmentPois' + label,
            position: position,
            text: label,
            level: level,
            ...labelOptions,
          }),
        )
      }

      const handler = (labels: ExtendLabel[]) => {
        const showingLabels: ExtendLabel[] = labels.filter(
          (label) => label.show,
        )
        const poiLabels: ExtendLabel[] = showingLabels.filter(
          (label) => label.level === LabelLevelMap.poi,
        )
        poiMarkerCollection.removeAll()
        for (const label of poiLabels) {
          const data = label.data
          const icon = getPOIIcon([data?.midType, data?.bigType])
          poiMarkerCollection.add({
            image: icon,
            position: label.position,
            width: 16,
            height: 16,
          })
        }
      }

      labelCollection.on('collisionCheck', handler)
      preCollisionCheckHandler.current = handler
      preLabelRef.current = addedLabels
    }

    return () => {
      attempt(() => {
        if (preCollisionCheckHandler.current) {
          labelCollection.off(
            'collisionCheck',
            preCollisionCheckHandler.current,
          )
        }
        baseAoiPrimitiveCollection.removeAll()
        buildingAoiPrimitiveCollection.removeAll()
        roadPrimitiveCollection.removeAll()
        for (let deleteLabel of preLabelRef.current) {
          labelCollection.remove(deleteLabel)
        }
        poiMarkerCollection.removeAll()
      })
    }
  }, [
    aois,
    roads,
    pois,
    arSetting.aoi,
    arSetting.poi,
    arSetting.mainRoad,
    arSetting.subRoad,
    arSetting.text,
  ])

  return <></>
}

export default GeodataRender
