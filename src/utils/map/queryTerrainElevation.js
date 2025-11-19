import { getTerrainUrl } from '@/constant/map'
import { Jimp, intToRGBA } from 'jimp'

// 地球半径
const r = 6378137
// 4326转3857
const lngLatMercator = (lng, lat) => {
  let x = lng * (Math.PI / 180) * r
  let rad = lat * (Math.PI / 180)
  let sin = Math.sin(rad)
  let y = (r / 2) * Math.log((1 + sin) / (1 - sin))
  return [x, y]
}

// 地球周长
const C = 2 * Math.PI * r
// 瓦片像素
const tileSize = 512
// 获取某一层级下的分辨率(X,Y方向适)
const getResolution = (n) => {
  const tileNums = Math.pow(2, n)
  const tileTotalPx = tileNums * tileSize
  return C / tileTotalPx
}

// 根据像素坐标及缩放层级计算瓦片行列号
const getTileRowAndCol = (x, y, z) => {
  x += C / 2
  y = C / 2 - y
  let resolutionX = getResolution(z)
  let row = Math.floor(x / resolutionX / tileSize)
  let col = Math.floor(y / resolutionX / tileSize)
  // 计算经纬度在当前瓦片的像素位置
  let px = x / resolutionX - row * tileSize
  let py = y / resolutionX - col * tileSize
  return [row, col, px, py]
}

// 获取像素坐标
const getPixelCoordinates = (lng, lat, z) => {
  const [x, y] = lngLatMercator(lng, lat)
  const [row, col, px, py] = getTileRowAndCol(x, y, z)

  return { pixelX: px, pixelY: py, row, col, z }
}
// 缓存瓦片
let images = {}

// 从瓦片图像中获取RGB值
const getRGBValue = async (lng, lat, z) => {
  const { pixelX, pixelY, row, col } = getPixelCoordinates(lng, lat, z)
  let image = null
  if (images[`${z}/${row}/${col}`]) {
    image = images[`${z}/${row}/${col}`]
  } else if (images[`${z}/${row}/${col}`] === 0) {
    image = images[`${z}/${row}/${col}`]
  } else {
    const url = getTerrainUrl().replace(/\{(z|x|y)\}/g, (_, key) => {
      switch (key) {
        case 'z':
          return z
        case 'x':
          return row
        case 'y':
          return col
      }
    })

    // console.log('url', url)
    // const url = `http://61.153.111.197:32650/data/maptiler-terrain-rgb/${z}/${row}/${col}.png`;
    image = await Jimp.read(url).catch((err) => {
      return 0
    })
    images[`${z}/${row}/${col}`] = image
  }

  if (!image) return 0

  const pixelColor = image.getPixelColor(pixelX, pixelY)
  // 使用jimp的getColor方法获取RGB值
  const rgb = intToRGBA(pixelColor)
  return [rgb.r, rgb.g, rgb.b]
}

// RGB值到海拔的映射关系
const rgbToElevation = (r, g, b) => {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1
}

const z = 10 // 瓦片缩放级别

const queryTerrainElevation = async (lng, lat) => {
  const rgb = await getRGBValue(lng, lat, z)
  if (!rgb) return 0
  const elevation = rgbToElevation(rgb[0], rgb[1], rgb[2])
  return elevation
}

const clear = () => {
  // 清除缓存
  images = {}
}

const queryTerrain = async (lng, lat) => {
  const elevation = await queryTerrainElevation(lng, lat)
  console.log('elevation', elevation)
  return elevation
}

export { queryTerrainElevation, clear, queryTerrain }

// 测试
// const elevation = await queryTerrainElevation(120, 30)
// console.log(`海拔: ${elevation}米`)
