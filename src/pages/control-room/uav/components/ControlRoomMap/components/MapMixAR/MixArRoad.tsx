import { useThrottleEffect } from 'ahooks';
import { memo, type FC } from 'react';
import { useCesium } from 'resium';
import * as Cesium from 'cesium';
import { attempt, flatten } from 'lodash';
import { Feature } from 'geojson';

type PropsType = {
  data: Feature[];
};

/** 虚实融合 道路绘制 */
const MixARRoad: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium();

  useThrottleEffect(
    () => {
      if (!viewer?.scene) {
        return;
      }
      const instances: Cesium.GeometryInstance[] = [];
      for (const f of data) {
        if (f.geometry.type === 'LineString') {
          const positions = Cesium.Cartesian3.fromDegreesArray(
            flatten(f.geometry.coordinates),
          );
          instances.push(
            new Cesium.GeometryInstance({
              geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 1.0,
                vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
              }),
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                  Cesium.Color.fromCssColorString('#fbbf24').withAlpha(1.0),
                ),
              },
            }),
          );
        } else if (f.geometry.type === 'MultiLineString') {
          for (const cg of f.geometry.coordinates) {
            const positions = Cesium.Cartesian3.fromDegreesArray(flatten(cg));
            instances.push(
              new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                  positions: positions,
                  width: 1.0,
                  vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
                }),
                attributes: {
                  color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.fromCssColorString('#fbbf24').withAlpha(1.0),
                  ),
                },
              }),
            );
          }
        }
      }

      // 创建线条外观
      const appearance = new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString('#fbbf24').withAlpha(1.0),
        }),
      });

      const primitive = new Cesium.Primitive({
        geometryInstances: instances, //可以是实例数组
        appearance,
      });
      viewer.scene.primitives.add(primitive);

      return () => {
        attempt(() => viewer.scene.primitives.remove(primitive));
      };
    },
    [data],
    {
      wait: 1000,
    },
  );

  return <></>;
});

MixARRoad.displayName = 'MixARRoad';

export default MixARRoad;
