import AppEmpty from '@/components/AppEmpty'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { InputNumber } from 'antd'
import { memo, type FC } from 'react'

type PropsType = unknown

const WaypointParamsConfig: FC<PropsType> = memo(() => {
  const { t: _t } = useTranslation()
  const waypoint = usePointCloud3DWaylineStore(
    (s) => s.waypointsConfig[s.currentIndex],
  )

  if (!waypoint) {
    return (
      <div className="pt-3">
        <AppEmpty />
      </div>
    )
  }

  const handleChange = (
    type: 'x' | 'y' | 'z' | 'q_w' | 'q_x' | 'q_y' | 'q_z',
    value: number,
  ) => {
    const updateWaypoint =
      usePointCloud3DWaylineStore.getState().updateCurrentWaypoint
    updateWaypoint({
      [type]: value,
    })
  }

  return (
    <div>
      {/* <div className="my-2">z</div>
      <InputNumber
        value={Number(waypoint?.z.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('z', e as number)}
      /> */}
      <div className="my-2">x</div>
      <InputNumber
        value={Number(waypoint?.x.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('x', e as number)}
      />
      <div className="my-2">y</div>
      <InputNumber
        value={Number(waypoint?.y.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('y', e as number)}
      />
      <div className="my-2">qw</div>
      <InputNumber
        value={Number(waypoint?.q_w.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('q_w', e as number)}
      />
      <div className="my-2">qx</div>
      <InputNumber
        value={Number(waypoint?.q_x.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('q_x', e as number)}
      />
      <div className="my-2">qy</div>
      <InputNumber
        value={Number(waypoint?.q_y.toFixed(2) ?? 0)}
        className="w-full"
      />
      <div className="my-2">qz</div>
      <InputNumber
        value={Number(waypoint?.q_z.toFixed(2) ?? 0)}
        className="w-full"
        onChange={(e) => handleChange('q_z', e as number)}
      />
    </div>
  )
})

WaypointParamsConfig.displayName = 'WaypointParamsConfig'

export default WaypointParamsConfig
