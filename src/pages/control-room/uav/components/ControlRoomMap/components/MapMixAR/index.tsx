import useMixARStore from '@/store/control-room/useMixAR.store';
import { memo, useEffect, useState, type FC } from 'react';
import MixARFov from './MixARFov';
import MixARBuilding from './MixARBuilding';
import MixARRoad from './MixArRoad';
import { Feature } from 'geojson';

type PropsType = unknown;

const checkClosed = (coordinates: number[][]) =>
  coordinates[0][0] === coordinates.at(-1)?.[0] &&
  coordinates[0][1] === coordinates.at(-1)?.[1];

const MapMixAR: FC<PropsType> = memo(() => {
  const features = useMixARStore((s) => s.features);
  const referenceLast = useMixARStore(
    (s) => s.referenceLastMap || s.referenceLastAR,
  );

  const [data, setData] = useState<Feature[]>([]);
  const [lineData, setLineData] = useState<Feature[]>([]);

  useEffect(() => {
    if (referenceLast) {
      return;
    }
    const nextData: Feature[] = [];
    const nextLineData: Feature[] = [];
    for (const f of features) {
      if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
        nextData.push(f);
        continue;
      }
      if (f.geometry.type === 'LineString') {
        if (checkClosed(f.geometry.coordinates)) {
          nextData.push(f);
        } else {
          nextLineData.push(f);
        }
        continue;
      }
      if (f.geometry.type === 'MultiLineString') {
        if (f.geometry.coordinates.every((c) => checkClosed(c))) {
          nextData.push(f);
        } else {
          nextLineData.push(f);
        }
      }
    }
    setData(nextData);
    setLineData(nextLineData);
  }, [referenceLast, features]);

  return (
    <>
      <MixARFov />
      <MixARBuilding data={data} />
      <MixARRoad data={lineData} />
    </>
  );
});

MapMixAR.displayName = 'MapMixAR';

export default MapMixAR;
