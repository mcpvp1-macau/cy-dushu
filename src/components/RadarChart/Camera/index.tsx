import { useDeepCompareEffect } from 'ahooks';
import { Leafer, Line } from 'leafer-ui';
import React from 'react';

interface Props {
  leafer?: Leafer;
  R?: number;
  fov: number;
  dis: number;
  yaw: number;
  max?: number;
  color?: string;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

const Camera: React.FC<Props> = (props) => {
  const {
    leafer,
    R,
    fov,
    dis = 1000,
    yaw,
    max = 1000,
    color = '#15B371',
    left = 10,
    // right = 10,
    top = 10,
    // bottom = 10,
  } = props;

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  useDeepCompareEffect(() => {
    const centerX = left + R;
    const centerY = top + R;
    // 1
    const x1 =
      left +
      R +
      R * (dis / max) * Math.cos(degreesToRadians(yaw - fov / 2 - 90));
    const y1 =
      top +
      R +
      R * (dis / max) * Math.sin(degreesToRadians(yaw - fov / 2 - 90));

    // 2
    const x2 =
      left +
      R +
      R * (dis / max) * Math.cos(degreesToRadians(yaw + fov / 2 - 90));
    const y2 =
      top +
      R +
      R * (dis / max) * Math.sin(degreesToRadians(yaw + fov / 2 - 90));
    const line = new Line({
      points: [centerX, centerY, x1, y1, x2, y2, centerX, centerY],
      cornerRadius: 1,
      strokeWidth: 1,
      stroke: color,
    });
    leafer.add(line);
    return () => {
      leafer.remove(line);
    };
  }, [R, fov, dis, yaw]);

  return <></>;
};

export default React.memo(Camera);
