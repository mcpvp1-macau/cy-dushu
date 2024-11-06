import { memo, useEffect, type FC } from 'react';
import { useCesium } from 'resium';
import * as Cesium from 'cesium';

type PropsType = {
  from: [number, number];
  to: [number, number];
};

const PathLine: FC<PropsType> = memo(({ from, to }) => {
  const { viewer } = useCesium();
  useEffect(() => {
    if (!viewer) return;
    const entity = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          from[0],
          from[1],
          to[0],
          to[1],
        ]),
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.fromCssColorString('#03D68F'),
          glowPower: 0.2,
        }),
        clampToGround: true,
      },
    });
    return () => {
      try {
        viewer.entities.remove(entity);
      } catch (e) {}
    };
  }, [from, to]);
  return <></>;
});

export default PathLine;
