type GimbalType = {
  name: string
  camera_w: number
  camera_h: number
  camera_d: number
  wide_camera_w: number
  wide_camera_h: number
  min_focal: number
  max_focal: number
  max_ratio: number
  wide_focal: number
  wide_pixel_size_height: number
  wide_pixel_size_width: number
}

const gimbalMap: Record<number, GimbalType> = {
  42: {
    name: 'Zenmuse H20',
    camera_w: 7.41,
    camera_h: 5.66,
    camera_d: 9.32,
    wide_camera_w: 6.29,
    wide_camera_h: 4.71,
    min_focal: 6.83,
    max_focal: 119.94,
    max_ratio: 23,
    wide_focal: 4.5,
    wide_pixel_size_height: 0.00155,
    wide_pixel_size_width: 0.00155,
  },
  43: {
    name: 'Zenmuse H20T',
    camera_w: 7.41,
    camera_h: 5.66,
    camera_d: 9.32,
    wide_camera_w: 6.29,
    wide_camera_h: 4.71,
    min_focal: 6.83,
    max_focal: 119.94,
    max_ratio: 23,
    wide_focal: 4.5,
    wide_pixel_size_height: 0.00155,
    wide_pixel_size_width: 0.00155,
  },
  52: {
    name: 'M30 Camera',
    camera_w: 6.4,
    camera_h: 4.8,
    camera_d: 8,
    wide_camera_w: 6.4,
    wide_camera_h: 4.8,
    min_focal: 21,
    max_focal: 75,
    max_ratio: 16,
    wide_focal: 4.5,
    wide_pixel_size_height: 0.0016,
    wide_pixel_size_width: 0.0016,
  },
  53: {
    name: 'M30T Camera',
    camera_w: 6.4,
    camera_h: 4.8,
    camera_d: 8,
    min_focal: 21,
    max_focal: 75,
    max_ratio: 16,
    wide_focal: 4.5,
    wide_camera_w: 6.4,
    wide_camera_h: 4.8,
    wide_pixel_size_height: 0.0016,
    wide_pixel_size_width: 0.0016,
  },
  61: {
    name: 'Zenmuse H20N',
    camera_w: 7.79,
    camera_h: 4.38,
    camera_d: 8.94,
    wide_camera_w: 5.76,
    wide_camera_h: 3.24,
    min_focal: 6.8,
    max_focal: 119.9,
    max_ratio: 20,
    wide_focal: 4.5,
    wide_pixel_size_height: 0.003,
    wide_pixel_size_width: 0.003,
  },
  66: {
    name: 'M3E Camera',
    camera_w: 6.4,
    camera_h: 4.8,
    camera_d: 8,
    min_focal: 29.85,
    max_focal: 0.0,
    max_ratio: 7,
    wide_focal: 12.29,
    wide_camera_w: 17.4,
    wide_camera_h: 13,
    wide_pixel_size_height: 0.0033,
    wide_pixel_size_width: 0.0033,
  },
  67: {
    name: 'M3T Camera',
    camera_w: 6.4,
    camera_h: 4.8,
    camera_d: 8,
    min_focal: 30,
    max_focal: 0.0,
    max_ratio: 7,
    wide_focal: 4.4,
    wide_camera_w: 6.4,
    wide_camera_h: 4.8,
    wide_pixel_size_height: 0.0033,
    wide_pixel_size_width: 0.0033,
  },
  83: {
    name: 'H30T Camera',
    camera_w: 9.652,
    camera_h: 7.239,
    camera_d: 12.065,
    wide_camera_w: 7.386,
    wide_camera_h: 5.539,
    min_focal: 7.1,
    max_focal: 172,
    max_ratio: 32,
    wide_focal: 6.72,
    wide_pixel_size_height: 0.0013171397379913,
    wide_pixel_size_width: 0.0013171397379913,
  },
  1234: {
    name: 'MATRICE_4T',
    camera_w: 6.4, // 相机宽度（推测，单位 mm，基于 1/1.3 英寸传感器）
    camera_h: 4.8, // 相机高度（推测，单位 mm，基于 1/1.3 英寸传感器）
    camera_d: 8, // 相机深度（推测，单位 mm，假设镜头模组厚度）
    min_focal: 19.35, // 最小焦距（广角相机，24 mm）
    max_focal: 40, // 最大焦距（长焦相机，168 mm）
    max_ratio: 7, // 最大变焦倍数（长焦相机约 7x 光学变焦，混合变焦可达 56x）
    wide_focal: 12.287, // 广角相机焦距（24 mm）
    wide_camera_w: 17.4, // 广角相机宽度（推测，单位 mm，与变焦相机一致）
    wide_camera_h: 13.0, // 广角相机高度（推测，单位 mm，与变焦相机一致）
    wide_pixel_size_height: 0.0017, // 广角像素尺寸高度（1/1.3 英寸，48 MP，计算约 1.7 μm）
    wide_pixel_size_width: 0.0017, // 广角像素尺寸宽度（同上）
  },
}

export const gimbalNameMap: Record<string, number> = {
  H20T: 43,
  H20N: 61,
  H20: 42,
  M30: 52,
  M30T: 53,
  M3E: 66,
  M3T: 67,
  H30T: 83,
  MATRICE_4T: 1234,
}

/** 获取相机信息 */
export const getGimbalInfo = (nameOrId: string | number): GimbalType => {
  const res = gimbalMap[nameOrId] ?? gimbalMap[gimbalNameMap[nameOrId]]
  if (res) {
    return res
  }
  if (typeof nameOrId === 'string') {
    const gimbalName = nameOrId
      .toString()
      .split(' ')
      .find((e) => gimbalMap[gimbalNameMap[e]])
    if (gimbalName) {
      return gimbalMap[gimbalNameMap[gimbalName]]
    }
  }
  return gimbalMap[53]
}

export default gimbalMap
