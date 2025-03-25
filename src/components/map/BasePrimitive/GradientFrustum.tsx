import { useEffect } from 'react'
import { useCesium } from 'resium' // 使用 resium 简化 Cesium 集成
import * as Cesium from 'cesium'

const GradientFrustum = ({
  longitude, // 经度
  latitude, // 纬度
  height, // 高度
  fov, // 视角（度）
  aspect, // 宽高比
  yaw, // 偏航角（度）
  pitch, // 俯仰角（度）
  roll, // 滚转角（度）
  color1, // 渐变起始颜色 (RGB 或 Cesium.Color)
  color2, // 渐变结束颜色 (RGB 或 Cesium.Color)
}) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return
    viewer.scene.globe.depthTestAgainstTerrain = true

    // 创建渐变材质
    const gradientMaterial = new Cesium.Material({
      fabric: {
        type: 'GradientFrustum',
        uniforms: {
          color1: Cesium.Color.fromCssColorString(color1 || '#FF0000'), // 默认红色
          color2: Cesium.Color.fromCssColorString(color2 || '#0000FF'), // 默认蓝色
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            material.diffuse = vec3(st.t, st.s, 0.0);
            material.alpha = 1.0;
            return material;
          }
        `,
      },
    })

    // 创建视锥几何体
    const frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(fov || 30), // 默认 60 度
      aspectRatio: aspect || 1.0, // 默认 1.0
      near: 10.0, // 近裁剪面固定为 1
      far: 200.0, // 远裁剪面等于高度
    })

    // 设置位置和方向
    const position = Cesium.Cartesian3.fromDegrees(
      longitude || 0,
      latitude || 0,
      height / 2, // 视锥底部位于地面，中心点在 height/2
    )
    const hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toDegrees(yaw || 0), // 偏航
      Cesium.Math.toDegrees(pitch || 0), // 俯仰
      Cesium.Math.toDegrees(roll || 0), // 滚转
    )
    const orientation = Cesium.Quaternion.fromHeadingPitchRoll(hpr)

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.FrustumGeometry({
        frustum: frustum,
        origin: position,
        orientation: orientation,
      }),
    })

    // 创建并添加 Primitive
    const primitive = new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.MaterialAppearance({
        flat: true,
        material: gradientMaterial,
        translucent: false,
      }),
    })

    viewer.scene.primitives.add(primitive)

    // 清理函数，组件卸载时移除视锥
    return () => {
      if (viewer.scene.primitives.contains(primitive)) {
        viewer.scene.primitives.remove(primitive)
      }
    }
  }, [
    longitude,
    latitude,
    height,
    fov,
    aspect,
    yaw,
    pitch,
    roll,
    color1,
    color2,
  ])

  return null
}

export default GradientFrustum
