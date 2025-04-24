import { memo, type FC } from 'react'
import { floor } from 'lodash'
import InnerNarrowRect from '@/components/NarrowRect'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

const NarrowRect: FC<PropsType> = memo(() => {
  const focalMultiplier = useAirlineConfigStore((s) => s.uav.eoFovMultiplier)

  // const fov = calcFov(cameraInfo.focal, size.width, 1);
  // const tanFov = Math.tan((fov / 2) * (Math.PI / 180));
  // const y = size.width / tanFov;
  // const newFov = calcFov(cameraInfo.focal, size.width, focalMultiplier ?? 2);
  // const newTanFov = Math.tan((newFov / 2) * (Math.PI / 180));
  // const w = y * newTanFov;
  // 经过计算, 注释上面的与下面的代码等价
  // const w = size.width / (focalMultiplier ?? 2);
  // const h = (cameraInfo.sensorHeight / cameraInfo.sensorWidth) * w;
  //setNarrowRect([w, h]);

  const color = (focalMultiplier ?? 2) >= 20 ? '#fb923c' : '#34d399'

  return (
    <InnerNarrowRect
      multiplier={floor(focalMultiplier ?? 2, 1)}
      color={color}
    />
  )
})

NarrowRect.displayName = 'NarrowRect'

export default NarrowRect
