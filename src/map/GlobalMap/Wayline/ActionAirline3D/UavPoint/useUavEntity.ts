import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'

export const useUavEntity = () => {
  const { viewer } = useCesium()
  const uav = useAirlineConfigStore((s) => s.uav)

  const uavRef = useRef<Cesium.Entity | null>(null)
  const bottomEntityRef = useRef<Cesium.Entity | null>(null)
  const lineEntityRef = useRef<Cesium.Entity | null>(null)

  useEffect(() => {
    if (!viewer?.scene) {
      return
    }

    const { pointX, pointY, pointZ } = uav

    // 定义模型的旋转角度
    const heading = Cesium.Math.toRadians(180 + (uav.uavHeading ?? 0)) // 方位角，0是北方，顺时针旋转
    const pitch = Cesium.Math.toRadians(0) // 俯仰角，负值是向下，正值是向上
    const roll = Cesium.Math.toRadians(0) // 横滚角

    // 计算模型的旋转矩阵
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr,
    )
    // 航点
    const entity = viewer.entities.add({
      position,
      /* @ts-ignore */
      orientation: orientation,
      model: {
        uri: '/ja-map/models/uav3.glb',
        minimumPixelSize: 50,
        maximumScale: 200,
        scale: 0.01,
        heightReference: Cesium.HeightReference.NONE, // 直接使用position设置的高度
      },
    })

    // 地形点
    const bottomPosition = Cesium.Cartesian3.fromDegrees(pointX, pointY, 0)
    const bottomEntity = viewer.entities.add({
      position: bottomPosition,
      billboard: {
        image: '/images/airline/ground-point.svg',
        scale: 0.8,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    // const dashPostions = new Cesium.CallbackProperty((_, result) => {
    //   const positions = [position, bottomPosition];
    //   if (Cesium.defined(result)) {
    //     result.length = 0; // 清空现有数组
    //     result.push(...positions);
    //   }
    //   return positions;
    // }, false);
    // 航点与地形点之间的虚线
    const lineEntity = viewer.entities.add({
      polyline: {
        positions: [position, bottomPosition],
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#FFF67F'),
          dashLength: 8,
        }),
      },
    })

    viewer.scene.globe.depthTestAgainstTerrain = true

    uavRef.current = entity
    bottomEntityRef.current = bottomEntity
    lineEntityRef.current = lineEntity

    return () => {
      try {
        viewer?.entities?.remove(entity)
        viewer?.entities?.remove(bottomEntity)
        viewer?.entities?.remove(lineEntity)
        viewer.scene.globe.depthTestAgainstTerrain = false
      } catch (error) {}
    }
  }, [])

  useEffect(() => {
    if (uavRef.current) {
      const { pointX, pointY, pointZ, uavHeading } = uav
      const heading = Cesium.Math.toRadians(180 + (uavHeading ?? 0))
      const hpr = new Cesium.HeadingPitchRoll(heading, 0, 0)
      const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr,
      )
      /*@ts-ignore */
      uavRef.current.position = position
      /*@ts-ignore */
      uavRef.current.orientation = orientation
    }
    if (bottomEntityRef.current) {
      const { pointX, pointY } = uav
      /*@ts-ignore */
      bottomEntityRef.current.position = Cesium.Cartesian3.fromDegrees(
        pointX,
        pointY,
        0,
      )
    }
    if (lineEntityRef.current) {
      const { pointX, pointY, pointZ } = uav
      /*@ts-ignore */
      lineEntityRef.current.polyline.positions = [
        Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ),
        Cesium.Cartesian3.fromDegrees(pointX, pointY, 0),
      ]
    }
  }, [uav])
}
