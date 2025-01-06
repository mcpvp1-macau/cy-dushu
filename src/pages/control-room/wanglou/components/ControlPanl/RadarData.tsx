import RadarChart from '@/components/RadarChart'
import Camera from '@/components/RadarChart/Camera'
import Radar from '@/components/RadarChart/Radar'
import Target from '@/components/RadarChart/Target'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { WanglouDeviceTypeMap, WANGLOUTargetName } from '../StatusInfo/config'
import ChartCircle from '@/components/RadarChart/ChartCircle'
import ControlButtons from './ControlButtons'

const RadarData: React.FC = () => {
  const detail = useDeviceDetailStore((s) => s.deviceDetail)
  const state = useWangLouControlRoomStore((s) => s.state)
  const { longitude, latitude } = detail || {}
  const radar = detail?.childDevice?.find(
    (item: any) => item.deviceType === 'RADAR',
  )

  const Infrared = detail?.childDevice?.find(
    (item: any) =>
      item.productKey === WanglouDeviceTypeMap[WANGLOUTargetName.Infrared],
  )

  const VisibleLight = detail?.childDevice?.find(
    (item: any) =>
      item.productKey === WanglouDeviceTypeMap[WANGLOUTargetName.VisibleLight],
  )

  const Vibrator = detail?.childDevice?.find(
    (item: any) =>
      item.productKey === WanglouDeviceTypeMap[WANGLOUTargetName.Vibrator],
  )

  const lightState = useMemo(() => {
    return {
      ...VisibleLight?.properties,
      ...(state[VisibleLight?.deviceId || ''] || {}),
    }
  }, [state[VisibleLight?.deviceId || '']])

  const redState = useMemo(() => {
    return {
      ...Infrared?.properties,
      ...(state[Infrared?.deviceId || ''] || {}),
    }
  }, [state[Infrared?.deviceId || '']])


  // TODO 雷达目标
  const targetObj = {}

  const renderLenged = (label, color) => {
    return (
      <div className="flex">
        <div
          className="w-[14px] h-[14px] mr-[10px] mt-[4px] border-[#fff] border-[1px] rounded-[7px]"
          style={{ backgroundColor: color }}
        ></div>
        <div>{label}</div>
      </div>
    )
  }

  if (!longitude || !latitude) return '123'
  return (
    <div className="relative">
      <RadarChart id="1" width={350} height={200} max={1000}>
        <Radar
          center={{ lng: longitude, lat: latitude }} // 中心点
          radarRangeData={[]} // 雷达范围
          angle={90} // 雷达范围获取时不是从正北开始，这里写90
        />
        {/**
         * // 传入实时的视场角fov和偏航角yaw
         */}
        <Camera
          fov={lightState.fov || 30}
          dis={1000}
          yaw={(lightState.yaw || 1000) / 100}
        />
        <Camera
          fov={redState.fov || 30}
          dis={500}
          yaw={(redState.yaw || 1000) / 100}
          color="red"
        />
        {/**
         * // 传入真实震动仪坐标和半径
         */}

        {Vibrator &&
        Vibrator?.properties?.longitude &&
        Vibrator?.properties?.latitude ? (
          <ChartCircle
            point={{
              lng: Vibrator?.properties?.longitude,
              lat: Vibrator?.properties?.latitude,
            }} // 震动仪坐标
            center={{ lng: longitude, lat: latitude }} // 中心点
            radis={Vibrator?.properties?.detectionRadius} // 震动仪半径
            color={'#F29D49'}
            fill={'rgba(242, 157, 73, 0.26)'}
          />
        ) : (
          <></>
        )}

        {Object.keys(targetObj).map((id) => {
          const obj = targetObj[id]
          return obj.map((item: any, index: number) => {
            const last = index === obj.length - 1
            const { targetLongitude, targetLatitude } = item
            const tid = `radartarget-${last ? 'last' : 'nor'}-${
              item.targetId
            }-${item.targetPitch}-${item.targetYaw}-${detail?.deviceId}-${
              radar?.deviceId
            }-${item.sourceType}-${index}`
            if (index === obj.length - 1) {
              return (
                <Target
                  key={tid}
                  point={{ lng: targetLongitude, lat: targetLatitude }} // 震动仪坐标
                  center={{ lng: longitude, lat: latitude }} // 中心点
                  radis={10} // 震动仪半径
                  color={'#FFF'}
                  fill={'#14CCBD'}
                  // onClick={onClick}
                />
              )
            }
            return (
              <Target
                key={tid}
                point={{ lng: targetLongitude, lat: targetLatitude }} // 震动仪坐标
                center={{ lng: longitude, lat: latitude }} // 中心点
                radis={3} // 震动仪半径
                color={'#3855AE'}
                fill={'#3855AE'}
                // onClick={onClick}
              />
            )
          })
        })}
      </RadarChart>
      <div className="absolute right-[20px] top-[40px]">
        {renderLenged('雷达范围', '#14CCBD')}
        {renderLenged('可见光范围', '#15B371')}
        {renderLenged('红外范围', '#DD4444')}
        {renderLenged('震动仪范围', '#F29D49')}
      </div>
      <ControlButtons />
    </div>
  )
}

export default RadarData
