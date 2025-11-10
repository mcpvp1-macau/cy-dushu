import { ImageryLayer, useCesium } from 'resium'
import { memo, useMemo, type FC } from 'react'
import * as Cesium from 'cesium'
import { useAsyncEffect } from 'ahooks'
import { re } from 'mathjs'

type Props = {
  url: string
}
const CustomI3SLayer: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium()

  const ref = useRef<Cesium.I3SDataProvider | null>(null)

  useAsyncEffect(async () => {
    if (!viewer) return

    if (!url) {
      if (ref.current) {
        viewer.scene.primitives.remove(ref.current)
        ref.current = null
      }
      return
    }
    try {
      ref.current = await Cesium.I3SDataProvider.fromUrl(url, {
        cesium3dTilesetOptions: {},
        showFeatures: true,
      })
      viewer?.scene.primitives.add(ref.current)
      if (ref.current.layers[0].tileset) {
        const i3sTileset = ref.current.layers[0].tileset
        i3sTileset.customShader = new Cesium.CustomShader({
          // lightingModel: Cesium.LightingModel.PBR,
          mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
          uniforms: {
            u_cameraLocalTransfromMatrix: {
              type: Cesium.UniformType.MAT4,
              value: Cesium.Matrix4.inverse(
                Cesium.Transforms.eastNorthUpToFixedFrame(
                  viewer.camera.position,
                ),
                new Cesium.Matrix4(),
              ),
            },
            u_cameraHeight: {
              type: Cesium.UniformType.FLOAT,
              value: 0.0,
            },
          },
          varyings: {
            v_localPosition: Cesium.VaryingType.VEC4,
          },
          vertexShaderText: `
				void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
					vec4 positionWC = czm_model * vec4(vsInput.attributes.positionMC, 1.0);
					v_localPosition = u_cameraLocalTransfromMatrix * positionWC;
				}
			`,
          fragmentShaderText: `
				void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
					float elevation = u_cameraHeight + v_localPosition.z;

					// 10 - 500 米 高度范围内渐变
					float colorMix = clamp(elevation / 100.0, 0.0, 1.0);

					vec3 colorMin = vec3(29, 23, 194) / 255.0;
					vec3 colorMax = vec3(6, 238, 184) / 255.0;

					material.specular = vec3(0.0);
					material.diffuse = mix(colorMin, colorMax, colorMix);
      	  material.emissive = vec3(0.0);
					material.roughness = 1.0;
    			material.occlusion = 1.0;
      	  material.alpha = 1.0;
    		}
			`,
        })
      }

      viewer.camera.changed.addEventListener(() => {
        const i3sTileset = ref.current?.layers[0].tileset
        i3sTileset?.customShader?.setUniform(
          'u_cameraLocalTransfromMatrix',
          Cesium.Matrix4.inverse(
            Cesium.Transforms.eastNorthUpToFixedFrame(viewer.camera.position),
            new Cesium.Matrix4(),
          ),
        )
        i3sTileset?.customShader?.setUniform(
          'u_cameraHeight',
          viewer.camera.positionCartographic.height,
        )
      })
    } catch (error) {
      console.error('I3S图层加载失败:', error)
    }
  }, [url])
  // 返回包装在div中的ImageryLayer组件

  useEffect(() => {
    return () => {
      try {
        if (ref.current) {
          viewer?.scene.primitives.remove(ref.current)
          ref.current = null
        }
      } catch (error) {
        console.error('I3S图层卸载失败:', error)
      }
    }
  }, [])
  return null
}

export default memo(CustomI3SLayer)
