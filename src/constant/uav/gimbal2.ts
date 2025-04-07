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

// export const gimbalMap: Record<Gimbal, GimbalType> = {
//   [Gimbal.M30]: {
//     name: 'M30 Camera',
//     wide: {
//       focal: 6.83,
//       width: 7.41,
//       height: 5.66,
//     },
//     zoom: {
//       width: 6.4,
//       height: 4.8,
//       minFocal: 21,
//       maxFocal: 75,
//       maxRatio: 16,
//     },
//   },
//   [Gimbal.H20N]: {
//     name: 'Zenmuse H20N',
//     wide: {
//       focal: 4.5,
//       width: 5.76,
//       height: 3.24,
//     },
//     zoom: {
//       width: 7.79,
//       height: 4.38,
//       minFocal: 6.8,
//       maxFocal: 119.9,
//       maxRatio: 20,
//     },
//   },
//   [Gimbal.H20T]: {
//     name: 'Zenmuse H20T',
//     wide: {
//       focal: 4.5,
//       width: 6.29,
//       height: 4.71,
//     },
//   },
// }
