import { toMercator } from '@turf/turf'

const EARTH_RADIUS = 6378137
const worldMercMax = Math.PI * EARTH_RADIUS
const worldMercMin = -1 * worldMercMax
const worldMercSize = worldMercMax - worldMercMin

class Tile {
  x: number
  y: number
  z: number
  tileSize: number
  pixelSize: number
  bounds: any

  constructor(x: number, y: number, z: number, tileSize: number = 512) {
    if (x >= 2 ** z || y >= 2 ** z) {
      throw new Error('x or y is out of range')
    }

    this.x = x
    this.y = y
    this.z = z

    this.tileSize = tileSize
    this.pixelSize = this.getPixelSizeInMeter()
    this.bounds = this.getBounds()
  }

  getBounds() {
    const colAndRows = 2 ** this.z

    const tileSize = worldMercSize / colAndRows

    const leftTopLng = -worldMercSize / 2 + this.x * tileSize
    const leftTopLat = worldMercSize / 2 - this.y * tileSize
    const rightBottomLng = -worldMercSize / 2 + (this.x + 1) * tileSize
    const rightBottomLat = worldMercSize / 2 - (this.y + 1) * tileSize

    return {
      leftTopLng,
      leftTopLat,
      rightBottomLng,
      rightBottomLat,
    }
  }

  getPixelSizeInMeter() {
    const tileWidth = worldMercSize / 2 ** this.z
    const pixelSize = tileWidth / this.tileSize

    return pixelSize
  }

  /**返回x，y像素的索引所在像素的中心点坐标
   * @returns
   */
  getPixelCoordinate(x: number, y: number) {
    if (x > this.tileSize - 1 || y > this.tileSize - 1) {
      throw new Error('x or y is out of range')
    }

    const { leftTopLng, leftTopLat } = this.bounds
    const pixelSize = this.pixelSize

    const coordX = leftTopLng + x * pixelSize + 0.5 * pixelSize
    const coordY = leftTopLat - y * pixelSize - 0.5 * pixelSize

    return [coordX, coordY]
  }

  /**通过坐标计算像素索引*/
  getPixelIndex(coord: [number, number]) {
    const { leftTopLng, leftTopLat } = this.bounds
    const pixelSize = this.pixelSize

    const x = Math.floor((coord[0] - leftTopLng) / pixelSize)
    const y = Math.floor((leftTopLat - coord[1]) / pixelSize)

    return {
      x: x === this.tileSize ? 0 : x,
      y: y === this.tileSize ? 0 : y,
    }
  }

  static getTile(coord: [number, number], z: number) {
    const tileSize = worldMercSize / 2 ** z

    const x = Math.floor((coord[0] - worldMercMin) / tileSize)
    const y = Math.floor((worldMercMax - coord[1]) / tileSize)

    const result = {
      x: x === 2 ** z ? 0 : x,
      y: y === 2 ** z ? 0 : y,
      z,
    }

    return result
  }
}

const TILE_SIZE = 512 // 瓦片大小

/**通过网络获取位置对应的 rgb-terrain-tile 来获取高度， */
const getHeightsFromRGBTile = async (
  coordinates: [number, number][],
  requestLevel: number = 10,
) => {
  const TILE_LEVEL = requestLevel

  const baseTerrainUrl =
    globalConfig.terrainUrl || `/data/maptiler-terrain-rgb/{z}/{x}/{y}.png`

  // 保存每个坐标对应的瓦片信息
  const tileMap: Record<string, Tile> = {}
  const coordInTiles: string[] = []
  for (let coordinate of coordinates) {
    const mercatorCoordinate = toMercator(coordinate)
    const { x: tileX, y: tileY } = Tile.getTile(mercatorCoordinate, TILE_LEVEL)
    coordInTiles.push(`${tileX}-${tileY}`)
    if (!tileMap[`${tileX}-${tileY}`]) {
      tileMap[`${tileX}-${tileY}`] = new Tile(
        tileX,
        tileY,
        TILE_LEVEL,
        TILE_SIZE,
      )
    }
  }

  // 根据瓦片请求数据
  const tileKeys = Object.keys(tileMap)
  const promises: Promise<Response>[] = []
  tileKeys.forEach((tileKey) => {
    const tile = tileMap[tileKey]
    promises.push(
      fetch(
        baseTerrainUrl.replace(
          '/{z}/{x}/{y}',
          `/${TILE_LEVEL}/${tile.x}/${tile.y}`,
        ),
      ),
    )
  })

  const responses = await Promise.all(promises)
  const images = await Promise.all(responses.map((response) => response.blob()))

  const tileImageMap: Record<string, ImageBitmap> = {}
  await Promise.all(
    images.map(async (image, index) => {
      tileImageMap[tileKeys[index]] = await createImageBitmap(image)
    }),
  )

  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  const heights = coordinates.map((coordinate, index) => {
    const tileKey = coordInTiles[index]
    const tile = tileMap[tileKey]

    const pixelIndex = tile.getPixelIndex(toMercator(coordinate))
    const image = tileImageMap[tileKey]

    ctx.drawImage(image, 0, 0)
    const data = ctx.getImageData(pixelIndex.x, pixelIndex.y, 1, 1).data

    const [r, g, b, a] = data

    return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1
  })

  return heights
}

export const runTest = async (tileLevel: number = 10) => {
  const data = [
    [119.962553, 30.274396], // 杭州 25.4
    [120.000507, 30.519248], // 杭州 219.6
    [74.591398, 35.259589], // 喜马拉雅 7742.7
    [-85.431022, 38.459268], // 美国 174.6
    [89.18267, 42.932228], // 吐鲁番高昌区 -5.2
  ] as [number, number][]
  const expectHeight = [25.4, 219.6, 7742.7, 174.6, -5.2]

  const heights = await getHeightsFromRGBTile(data, tileLevel)

  expectHeight.forEach((expectHeight, index) => {
    const height = heights[index]
    const diff = Math.abs(height - expectHeight)
    const diffPercent = (diff / expectHeight) * 100
    console.log(
      `${data[index]} 实际高度: ${height}, 期望高度: ${expectHeight}, 误差: ${diffPercent}%`,
    )
  })
}

export default getHeightsFromRGBTile
