import { useThrottleEffect } from 'ahooks';
import { memo, type FC } from 'react';
import { useCesium } from 'resium';
import * as Cesium from 'cesium';
import { attempt, flatten } from 'lodash';
import { Feature, Position } from 'geojson';

type PropsType = {
  data: Feature[];
};

const MixARBuilding: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium();

  useThrottleEffect(
    () => {
      if (!viewer?.scene) {
        return;
      }
      const instances: Cesium.GeometryInstance[] = [];
      const instancesOutline: Cesium.GeometryInstance[] = [];

      const addPolygon = (coordinates: Position[]) => {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          flatten(coordinates),
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(positions),
              extrudedHeight: 1,
            }),

            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString('#fff').withAlpha(0.2),
              ),
            },
          }),
        );
      };
      const addPolygonOutline = (coordinates: Position[]) => {
        const p = flatten(coordinates);
        const positions = Cesium.Cartesian3.fromDegreesArray(p);
        // 创建边界线几何实例
        const instance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonOutlineGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
          }),

          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString('#000'),
            ),
          },
        });
        instancesOutline.push(instance);
      };

      for (const f of data) {
        switch (f.geometry.type) {
          case 'LineString':
            addPolygon(f.geometry.coordinates);
            addPolygonOutline(f.geometry.coordinates);
            break;
          case 'MultiLineString':
            for (const cg of f.geometry.coordinates) {
              addPolygon(cg);
              addPolygonOutline(cg);
            }
            break;
          case 'Polygon':
            for (const cg of f.geometry.coordinates) {
              addPolygon(cg);
              addPolygonOutline(cg);
            }
            break;
          case 'MultiPolygon':
            for (const cg of f.geometry.coordinates) {
              addPolygon(cg[0]);
              addPolygonOutline(cg[0]);
            }
            break;
        }
      }

      const outlinePrimitive = new Cesium.Primitive({
        geometryInstances: instancesOutline,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          renderState: {
            lineWidth: Math.min(3.0, viewer.scene.maximumAliasedLineWidth),
          },
        }),
      });

      const primitive = new Cesium.Primitive({
        geometryInstances: instances, //可以是实例数组
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true, // 确保材质没有反光效果
        }),
      });
      viewer.scene.primitives.add(primitive);
      viewer.scene.primitives.add(outlinePrimitive);

      return () => {
        attempt(() => viewer.scene.primitives.remove(primitive));
        attempt(() => viewer.scene.primitives.remove(outlinePrimitive));
      };
    },
    [data],
    {
      wait: 1000,
    },
  );

  return <></>;
});

MixARBuilding.displayName = 'MixARBuilding';

export default MixARBuilding;
