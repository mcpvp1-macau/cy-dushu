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
