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
  max?: number;
  color?: string;
  fill?: string;
  point: LngLatPoint;
  center: LngLatPoint;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  radis: number;
  onClick?: () => void;
}

const Target: React.FC<Props> = (props) => {
  const {
    leafer,
    center,
    point,
    R = 1,
    left = 10,
    // right = 10,
    top = 10,
    // bottom = 10,
    max = 1000,
    color,
    fill,
    radis = 10,
    onClick,
  } = props;
  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  useDeepCompareEffect(() => {
    if (!leafer) {
      return
    }
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

    const ellipse = new Ellipse({
      x: x1 - radis / 2,
      y: y1 - radis / 2,
      width: radis,
      height: radis,
      innerRadius: 1,
      stroke: color,
      strokeWidth: 1,
      strokeAlign: 'center',
      strokeCap: 'round',
      fill: fill,
      cursor: 'pointer',
    });
    ellipse.on('click', () => {
      onClick?.();
    });

    leafer.add(ellipse);
    return () => {
      leafer.remove(ellipse);
    };
  }, [R, center, point, max]);
  return <></>;
};

export default React.memo(Target);
