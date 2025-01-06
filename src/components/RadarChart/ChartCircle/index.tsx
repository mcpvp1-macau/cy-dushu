import * as turf from '@turf/turf';
import { useDeepCompareEffect } from 'ahooks';
import { Ellipse, Leafer } from 'leafer-ui';
import React from 'react';

interface LngLatPoint {
  lng: number;
  lat: number;
}

interface Props {
  leafer?: Leafer;
  R?: number;
  point: LngLatPoint;
  center: LngLatPoint;
  max?: number;
  color?: string;
  radis: number;
  fill?: string;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

const ChartCircle: React.FC<Props> = (props) => {
  const {
    leafer,
    R,
    point,
    center,
    max = 1000,
    color = '#15B371',
    fill,
    radis,
    left = 10,
    // right = 10,
    top = 10,
    // bottom = 10,
  } = props;

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  useDeepCompareEffect(() => {
    const centerPoint = turf.point([center.lng, center.lat]);
    const thepoint = turf.point([point.lng, point.lat]);
    const bearing = turf.rhumbBearing(centerPoint, thepoint);
    const distance =
      turf.distance(centerPoint, thepoint, {
        units: 'kilometers',
      }) * 1000;

    // const centerX = left + R;
    // const centerY = top + R;
    // 1
    const x1 =
      left +
      R +
      R * (distance / max) * Math.cos(degreesToRadians(bearing - 90));
    const y1 =
      top + R + R * (distance / max) * Math.sin(degreesToRadians(bearing - 90));

    const a = (2 * R * radis) / max;

    const ellipse = new Ellipse({
      x: x1 - a / 2,
      y: y1 - a / 2,
      width: a,
      height: a,
      innerRadius: 1,
      stroke: color,
      strokeWidth: 1,
      strokeAlign: 'center',
      strokeCap: 'round',
      fill: fill,
    });

    leafer.add(ellipse);
    return () => {
      leafer.remove(ellipse);
    };
  }, [R, center, point, max]);

  return <></>;
};

export default React.memo(ChartCircle);
