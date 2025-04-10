import { calcCameraParameters, getGimbalInfo } from '@/constant/uav/gimbalV2'

/** 计算相机参数 */
const useCalcGimbalParams = (
  gimbalName: string,
  lensType: 'wide' | 'zoom' | 'ir' = 'wide',
  zoom,
) => {
  const gimbalInfo = useMemo(() => getGimbalInfo(gimbalName), [gimbalName])

  return useMemo(
    () => calcCameraParameters(gimbalInfo, lensType, zoom),
    [gimbalInfo, lensType, zoom],
  )
}

export default useCalcGimbalParams
