import serverAutoPhotograph from '@/service/servers/serverAutoPhotograph'

/** 自动拍照计算 */
export const autoPhotoGraphCalc = (data: {
  photo: string
  uav_parameters: Record<string, any>
  pictureBox: { x1: number; y1: number; x2: number; y2: number }
}) => {
  return serverAutoPhotograph.post('/auto_photograph', data)
}

/** 自动拍照计算 V2 */
export const autoPhotoGraphCalcV2 = (data: {
  left_image: string
  left_uav_parameters: Record<string, any>
  left_box: { x1: number; y1: number; x2: number; y2: number } | null
  right_image: string
  right_uav_parameters: Record<string, any>
  right_box: { x1: number; y1: number; x2: number; y2: number } | null
}) => {
  return serverAutoPhotograph.post('/match_images', data)
}
