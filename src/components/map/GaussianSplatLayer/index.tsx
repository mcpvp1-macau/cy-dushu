import React from 'react'
import GaussianSplatLayer from './GaussianSplatLayer'
import { useCesium } from 'resium'
import ThreeOverlay from './ThreeOverlay'
import * as Cesium from 'cesium'

const GaussianSplatLayerCesium: React.FC = () => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (viewer) {
      viewer.camera?.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(5.30731, 51.70644, 65.24274),
        orientation: {
          heading: Cesium.Math.toRadians(127.00461),
          pitch: Cesium.Math.toRadians(-17.11404),
          roll: 0.0,
        },
        duration: 0,
      })
      const threeOverlay = new ThreeOverlay(viewer.camera)
      viewer.scene.postRender.addEventListener(() => {
        threeOverlay.render()
      })

      const layer = new GaussianSplatLayer(
        '/ja-map/models/target.splat',
        { lon: 5.308332, lat: 51.706254, height: 50.3 },
        { x: 1.199285294426387, y: -0.561475491622485, z: 2.430876453678189 },
      )
      threeOverlay.addGaussianSplatLayer(layer)
      const layer1 = new GaussianSplatLayer(
        '/ja-map/models/pb.splat',
        { lon: 5.30762, lat: 51.70612, height: 50.3 },
        { x: 1.9586619087229662, y: 0.4766092669791268, z: 2.3042657339892942 },
      )
      threeOverlay.addGaussianSplatLayer(layer1)
    }
  }, [])
  return null
}

export default GaussianSplatLayerCesium
