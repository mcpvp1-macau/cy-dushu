type GimbalType = {
  name: string
  /** 广角 */
  wide: {
    focal: number
    width: number
    height: number
  }
  /** 中长焦/长焦/等等 */
  tele?: {
    focal: number
    width: number
    height: number
    radio: number
  }[]
  /** 变焦 */
  zoom?: {
    width: number
    height: number
    minFocal: number
    maxFocal: number
    maxRatio: number
  }
  /** 红外相机 */
  ir?: {
    focal: number
    width: number
    height: number
  }
}

export enum Gimbal {
  /** 经纬 M30 系列 */
  M30,
  /** DJI Mavic 3T */
  M3T,
  /** DJI Mavic 3M */
  M3M,
  /** DJI Mavic 3E */
  M3E,
  /** 禅思 Zenmuse H20T */
  H20T,
  /**  H20N */
  H20N,
  /** M3TD（红外相机、长焦相机参数和 M3T 一致） */
  M3TD,
  /** M3D（参数和 M3E 一致） */
  M3D,
  /** DJI Matrice 4E/Matrice 4D */
  M4,
  /** DJI Matrice 4T/Matrice 4TD */
  M4T,
}

export const gimbalMap: Record<string, GimbalType> = {
  M30: {
    name: 'M30 Camera',
    wide: {
      focal: 4.5,
      width: 6.4,
      height: 4.8,
    },
    zoom: {
      width: 6.4,
      height: 4.8,
      minFocal: 21,
      maxFocal: 75,
      maxRatio: 16,
    },
    ir: {
      width: 7.68,
      height: 6.144,
      focal: 9.1,
    },
  },
  H20N: {
    name: 'Zenmuse H20N',
    wide: {
      focal: 4.5,
      width: 5.76,
      height: 3.24,
    },
    zoom: {
      width: 7.79,
      height: 4.38,
      minFocal: 6.8,
      maxFocal: 119.9,
      maxRatio: 20,
    },
  },
  H20T: {
    name: 'Zenmuse H20T',
    wide: {
      focal: 4.5,
      width: 6.29,
      height: 4.71,
    },
    zoom: {
      minFocal: 6.83,
      maxFocal: 119.94,
      maxRatio: 23,
      width: 7.41,
      height: 5.66,
    },
    ir: {
      focal: 13.5,
      width: 17.4,
      height: 13,
    },
  },
  M3E: {
    name: 'M3E Camera',
    wide: {
      width: 17.4,
      height: 13,
      focal: 12.29,
    },
    tele: [
      {
        width: 6.4,
        height: 4.8,
        focal: 30,
        radio: 8,
      },
    ],
  },
  M3T: {
    name: 'M3T Camera',
    wide: {
      width: 6.4,
      height: 4.8,
      focal: 4.4,
    },
    tele: [
      {
        width: 6.4,
        height: 4.8,
        focal: 30,
        radio: 8,
      },
    ],
    ir: {
      width: 7.68,
      height: 6.144,
      focal: 9.1,
    },
  },
  M4T: {
    name: 'M4T/M4TD',
    wide: {
      width: 9.69,
      height: 7.27,
      focal: 6.73,
    },
    tele: [
      {
        width: 9.69,
        height: 7.27,
        focal: 19.35,
        radio: 3,
      },
      {
        width: 8.29,
        height: 6.23,
        focal: 40,
        radio: 7,
      },
    ],
    ir: {
      width: 7.68,
      height: 6.14,
      focal: 12,
    },
  },
  M4E: {
    name: 'M4E/M4D',
    wide: {
      width: 9.69,
      height: 7.27,
      focal: 6.73,
    },
    tele: [
      {
        width: 9.69,
        height: 7.27,
        focal: 19.35,
        radio: 3,
      },
      {
        width: 8.29,
        height: 6.23,
        focal: 40,
        radio: 7,
      },
    ],
  },
}

const map = [
  [
    gimbalMap.M30,
    new Set([
      'M30',
      'M30_OR_M3T_CAMERA',
      'M30_CAMERA',
      'M30T_CAMERA',
      'M3T_CAMERA',
      'M3TD_CAMERA',
      'M3D_CAMERA',
      'M30 Camera',
    ]),
  ],
  [gimbalMap.H20T, new Set(['H20T', 'H20N', 'H20_CAMERA', 'Zenmuse H20T'])],
  [gimbalMap.M3E, new Set(['M3E_CAMERA', 'M3E', 'M3E Camera'])],
  [gimbalMap.M3T, new Set(['M3T', 'M3T_CAMERA', 'M3TD_CAMERA', 'M3T Camera'])],
  [gimbalMap.H30T, new Set(['H30T', 'H30_CAMERA', 'H30T Camera'])],
  [
    gimbalMap.M4T,
    new Set(['M4T', 'M4TD', 'MATRICE_4', 'MATRICE_4T', 'MATRICE_4T_CAMERA']),
  ],
  [gimbalMap.M4E, new Set(['MATRICE_4E_CAMERA', 'MATRICE_4E'])],
] as const

export const getGimbalInfo = (name: string) => {
  for (const [gimbal, set] of map) {
    if (set.has(name)) {
      return gimbal
    }
  }
  return gimbalMap.H20T
}

/** 计算相机参数 */
export const calcCameraParameters = (
  gimbal: GimbalType,
  lensType: 'wide' | 'zoom' | 'ir' = 'wide',
  zoom = 1,
) => {
  // 广角 ------------------------------------------------------------
  if (lensType === 'wide') {
    return {
      width: gimbal.wide.width,
      height: gimbal.wide.height,
      focal: gimbal.wide.focal,
    }
  }

  // 红外 ------------------------------------------------------------
  if (lensType === 'ir') {
    if (gimbal.ir) {
      return {
        width: gimbal.ir.width,
        height: gimbal.ir.height,
        focal: gimbal.ir.focal,
      }
    }
    return {
      width: gimbal.wide.width,
      height: gimbal.wide.height,
      focal: gimbal.wide.focal,
    }
  }

  // 变焦 ------------------------------------------------------------
  if (gimbal.zoom) {
    const df =
      (gimbal.zoom.maxFocal - gimbal.zoom.minFocal) / (gimbal.zoom.maxRatio - 2)
    const focal = gimbal.zoom.minFocal + df * (zoom - 2)
    return {
      width: gimbal.zoom.width,
      height: gimbal.zoom.height,
      focal,
    }
  }

  if (gimbal.tele) {
    let te = gimbal.tele[0]
    for (const t of gimbal.tele) {
      if (t.radio > zoom) {
        break
      }
      te = t
    }
    const df = te.focal / te.radio
    const focal = df * zoom
    return {
      width: te.width,
      height: te.height,
      focal,
    }
  }

  return {
    width: gimbal.wide.width,
    height: gimbal.wide.height,
    focal: gimbal.wide.focal * zoom,
  }
}
