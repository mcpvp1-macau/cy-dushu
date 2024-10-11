import * as Cesium from 'cesium';
import { attempt } from 'lodash';
import { useEffect } from 'react';
import { useCesium } from 'resium';

const useLockCameraPitch = (angle: number) => {

  const {viewer} = useCesium()

  useEffect(() => {
    if (!viewer) {
      return;
    }
    viewer.camera.setView({
      destination: viewer.camera.position,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(angle),
        roll: viewer.camera.roll,
      },
    });
    
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    return () => {
      attempt(() => {
        viewer.scene.screenSpaceCameraController.enableTilt = true;
      })
    }
  }, [viewer])
}

export default useLockCameraPitch;