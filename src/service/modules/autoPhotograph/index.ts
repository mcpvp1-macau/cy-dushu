import serverAutoPhotograph from '@/service/servers/serverAutoPhotograph'

/** 自动拍照计算 */
export const autoPhotoGraphCalc = (data: {
  photo: string
  uav_parameters: Record<string, any>
  pictureBox: { x1: number; y1: number; x2: number; y2: number }
}) => {
  return serverAutoPhotograph.post('/auto_photograph', data)
}
