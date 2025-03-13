import { shanghaiBanRoutes } from '@/assets/custom/shanghai_routes'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

const ShanghaiBanRoutes: FC<unknown> = memo(() => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return

    const entities: Cesium.Entity[] = []

    // Define an array of 22 distinct colors with higher saturation
    const routeColors = [
      Cesium.Color.fromCssColorString('#99CCFF'), // Bright Blue
      Cesium.Color.fromCssColorString('#FF99CC'), // Bright Pink
      Cesium.Color.fromCssColorString('#99FFCC'), // Bright Mint
      Cesium.Color.fromCssColorString('#FFCCFF'), // Bright Lavender
      Cesium.Color.fromCssColorString('#CCFFCC'), // Bright Green
      Cesium.Color.fromCssColorString('#CCFFFF'), // Bright Cyan
      Cesium.Color.fromCssColorString('#FFCC99'), // Bright Peach
      Cesium.Color.fromCssColorString('#FFFF99'), // Bright Yellow
      Cesium.Color.fromCssColorString('#CC99FF'), // Bright Purple
      Cesium.Color.fromCssColorString('#99FFFF'), // Bright Aqua
      Cesium.Color.fromCssColorString('#CCCCFF'), // Bright Periwinkle
      Cesium.Color.fromCssColorString('#FFDD99'), // Bright Gold
      Cesium.Color.fromCssColorString('#99DDFF'), // Bright Sky Blue
      Cesium.Color.fromCssColorString('#FF9999'), // Bright Coral
      Cesium.Color.fromCssColorString('#CC99CC'), // Bright Mauve
      Cesium.Color.fromCssColorString('#FFBBDD'), // Bright Rose
      Cesium.Color.fromCssColorString('#DDDDAA'), // Bright Tan
      Cesium.Color.fromCssColorString('#FFDDBB'), // Bright Apricot
      Cesium.Color.fromCssColorString('#EEFF99'), // Bright Lime
      Cesium.Color.fromCssColorString('#AAFFAA'), // Bright Spring Green
      Cesium.Color.fromCssColorString('#AADDFF'), // Bright Azure
      Cesium.Color.fromCssColorString('#FFAACC'), // Bright Hot Pink
    ]

    // Create dashed lines for each route with unique colors
    shanghaiBanRoutes.forEach((route, index) => {
      const positions = route.waypoints.map((waypoint) => {
        return Cesium.Cartesian3.fromDegrees(
          waypoint.longitude,
          waypoint.latitude,
          500,
        )
      })

      // Get color for this route (cycle through colors if more than 22 routes)
      const routeColor = routeColors[index % routeColors.length]

      // Create a polyline entity with dashed line appearance
      const entity = viewer.entities.add({
        name: route.route_name,
        polyline: {
          positions,
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: routeColor,
            dashLength: 16.0,
          }),
          clampToGround: true,
        },
      })

      entities.push(entity)

      // Add label in the middle of the route
      if (positions.length > 0) {
        // Get middle waypoint index
        const middleIndex = Math.floor(positions.length / 2)
        const middleWaypoint = route.waypoints[middleIndex]

        const labelEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            middleWaypoint.longitude,
            middleWaypoint.latitude,
            20,
          ),
          label: {
            text: route.route_name,
            font: '12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: routeColor.withAlpha(0.3), // Match the outline color with the route color
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })

        entities.push(labelEntity)
      }
    })

    // Cleanup function to remove entities when component unmounts
    return () => {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
    }
  }, [viewer])

  return <></>
})

ShanghaiBanRoutes.displayName = 'ShanghaiBanRoutes'

export default ShanghaiBanRoutes
