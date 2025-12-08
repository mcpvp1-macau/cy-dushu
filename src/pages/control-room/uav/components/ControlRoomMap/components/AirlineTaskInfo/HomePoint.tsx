import { memo, useEffect, type FC } from 'react';
import { useCesium } from 'resium';
import * as Cesium from 'cesium';
import image from '@/assets/imgs/takeoff-active.ea7a1012.svg';

type PropsType = {
  lng: number;
  lat: number;
};

const HomePoint: FC<PropsType> = memo(({ lng, lat }) => {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      billboard: {
        image: image,
        scale: 0.6,
        eyeOffset: new Cesium.Cartesian3(0, 0, -300),
      },
    });
    return () => {
      try {
        viewer.entities.remove(entity);
      } catch (_e) {}
    };
  }, [lng, lat]);
  return <></>;
});

export default HomePoint;
