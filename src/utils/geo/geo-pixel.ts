import proj4 from 'proj4'
import { cos, sin, tan, atan, sqrt } from 'mathjs'

proj4.defs('EPSG:32650', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs')

function wgs84ToUtm(
  lat: number,
  lon: number,
  zone: number = 50,
): [number, number] {
  const fromProj = `EPSG:4326` // WGS 84
  const toProj = `EPSG:326${zone}` // UTM Zone 50N
  const [CamX, CamY] = proj4(fromProj, toProj, [lon, lat])
  return [CamX, CamY]
}

function utmToWgs84(x: number, y: number, zone: number = 50): [number, number] {
  const fromProj = `EPSG:326${zone}` // UTM Zone 50N
  const toProj = `EPSG:4326` // WGS 84
  const [lon, lat] = proj4(fromProj, toProj, [x, y])
  return [lat, lon]
}

function rotateAndTranslate(
  CamX: number,
  CamY: number,
  W: number,
  K: number,
  dir: number,
): [number, number] {
  const x = CamX + W * cos(dir) + K * sin(dir)
  const y = CamY - W * sin(dir) + K * cos(dir)
  return [x, y]
}

function translateAndRotateBack(
  CamX: number,
  CamY: number,
  x: number,
  y: number,
  dir: number,
): [number, number] {
  const W = (x - CamX) * cos(dir) - (y - CamY) * sin(dir)
  const K = (x - CamX) * sin(dir) + (y - CamY) * cos(dir)
  return [W, K]
}

export function pixelToGps(
  pixelX: number,
  pixelY: number,
  imageWidth: number,
  imageHeight: number,
  cameraGpsCoords: [number, number, number],
  cameraOrientation: [number, number, number],
  cameraFocalLength: number = 4.5,
  sensorWidth: number = 6.4,
  K: number[][] = [
    [1525.8, 0.0, 962.2367],
    [0.0, 1523.6, 706.4672],
    [0.0, 0.0, 1.0],
  ],
  _dist: number[] = [0.1863, -0.3458, 0.0, 0.0, 0.0],
): [number, number] {
  const pitch = cameraOrientation[1]
  const yaw = cameraOrientation[2]
  const A = cameraGpsCoords[2]
  const [CamX, CamY] = wgs84ToUtm(cameraGpsCoords[0], cameraGpsCoords[1])
  console.log('CamX, CamY ', CamX, CamY)

  let fx, fy, cx, cy
  if (K[0][0] === 0) {
    const aspect = imageHeight / imageHeight
    fx = (cameraFocalLength / sensorWidth) * imageWidth
    fy = fx / aspect
    cx = imageWidth / 2
    cy = imageHeight / 2
  } else {
    fx = K[0][0]
    fy = K[1][1]
    cx = K[0][2]
    cy = K[1][2]
  }

  const X_c = (pixelX - cx) / fx
  const Y_c = (pixelY - cy) / fy
  const _Z_c = 1
  const K_val = A / tan(-pitch + Y_c)
  const R = sqrt(A ** 2 + K_val ** 2) as number
  const W = R * X_c

  const [x, y] = rotateAndTranslate(CamX, CamY, W, K_val, yaw)
  const [pixelLat, pixelLon] = utmToWgs84(x, y)
  console.log(
    `像素 (${pixelX}, ${pixelY}) 的 GPS 坐标: (${pixelLat}, ${pixelLon})`,
  )
  return [pixelLat, pixelLon]
}

export function gpsToPixel(
  gpsLat: number,
  gpsLon: number,
  imageWidth: number,
  imageHeight: number,
  cameraGpsCoords: [number, number, number],
  cameraOrientation: [number, number, number],
  cameraFocalLength: number,
  sensorWidth: number,
  K: number[][],
  _distParam: number,
): [number, number] {
  let fx, fy, cx, cy
  if (K[0][0] === 0) {
    const aspect = imageHeight / imageHeight
    fx = (cameraFocalLength / sensorWidth) * imageWidth
    fy = fx / aspect
    cx = imageWidth / 2
    cy = imageHeight / 2
  } else {
    fx = K[0][0]
    fy = K[1][1]
    cx = K[0][2]
    cy = K[1][2]
  }

  const [_roll, pitch, yaw] = cameraOrientation
  const [CamX, CamY] = wgs84ToUtm(cameraGpsCoords[0], cameraGpsCoords[1])
  const A = cameraGpsCoords[2]
  const [TargetX, TargetY] = wgs84ToUtm(gpsLat, gpsLon)
  const [W, K_val] = translateAndRotateBack(CamX, CamY, TargetX, TargetY, yaw)
  const Y_c = atan(A / K_val) + pitch
  const X_c = W / (sqrt(A ** 2 + K_val ** 2) as number)

  const pixelX = X_c * fx + cx
  const pixelY = Y_c * fy + cy
  console.log('像素点是', pixelX, pixelY)
  return [pixelX, pixelY]
}
