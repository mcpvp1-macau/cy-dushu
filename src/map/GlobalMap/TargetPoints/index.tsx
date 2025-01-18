import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import React from 'react'
import { PointPrimitive, PointPrimitiveCollection } from 'resium'
import * as Cesium from 'cesium'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import useBoardObjStore from '@/store/map/useBoardObj.store'

const sourceTypeColorMap: any = {
  RADAR: '#14CCBD',
  FUSION: '#4C90F0',
  VISUAL: '#15B371', // 可见光
  INFRARED: '#DD4444', // 红外
  VIBRATOR: '#F29D49', //震动仪
}

const TargetPoints: React.FC = () => {
  const radarTarget = useGlobalWsStore((s) => s.radarTarget)

  // const updateRightMode = useRightMode((s) => s.updateRightMode)
  // const updateDetailId = useRightMode((s) => s.updateDetailId)
  const setBoardObj = useBoardObjStore((s) => s.setBoardObj)
  const setBoardOpenMap = useBoardObjStore((s) => s.setBoardOpenMap)
  // const [boardObj, setBoardObj] = useState()
  // const [boardOpenMap, setBoardOpenMap] = useState({})

  // const onClick = (item) => {
  //   updateRightMode(RightModeEnum.RADAR_TARGET)
  //   updateDetailId(item)
  // }

  useEffect(() => {
    const newBoardObj: any = {}
    Object.keys(radarTarget).forEach((parentId) => {
      Object.keys(radarTarget[parentId]).forEach((deviceId) => {
        const device = radarTarget[parentId][deviceId]
        Object.keys(device).forEach((id) => {
          const lastRecord = device[id][device[id].length - 1]
          setBoardOpenMap((values) => ({
            ...values,
            [id]: values[id] ?? true,
          }))
          newBoardObj[id] = {
            ...lastRecord,
            parentId,
            deviceId,
          }
        })
      })
    })
    setBoardObj(newBoardObj)
  }, [radarTarget])

  return (
    <>
      <PointPrimitiveCollection>
        {Object.keys(radarTarget).map((parentId) => {
          return Object.keys(radarTarget[parentId]).map((deviceId) => {
            const device = radarTarget[parentId][deviceId]
            return Object.keys(device).map((id) => {
              return device[id].map((item: any, i: number) => {
                const last = i === device[id].length - 1
                const lng = Number(item.targetLongitude)
                const lat = Number(item.targetLatitude)
                const alt = Number(item.targetAltitude)
                const tid = `radartarget--${last ? 'last' : 'nor'}--${
                  item.targetId
                }--${item.targetPitch}--${
                  item.targetYaw
                }--${parentId}--${deviceId}--${item.sourceType}--${i}`
                let color = last
                  ? sourceTypeColorMap[item.sourceType] || '#3855AE'
                  : '#3855AE'
                /** 天朗独有的记忆 */
                if (item.targetState === 2) {
                  color = 'red'
                }
                return (
                  <React.Fragment key={tid}>
                    <PointPrimitive
                      id={tid}
                      color={Cesium.Color.fromCssColorString(color)}
                      position={Cesium.Cartesian3.fromDegrees(lng, lat, alt)}
                      pixelSize={last ? 14 : 5}
                      disableDepthTestDistance={50000}
                      outlineColor={Cesium.Color.fromCssColorString('#fff')}
                      outlineWidth={last ? 1.5 : 0}
                      // onClick={() => onClick(`${parentId}=${deviceId}=${id}`)}
                    />
                  </React.Fragment>
                )
              })
            })
          })
        })}
      </PointPrimitiveCollection>
    </>
  )
}

export default React.memo(TargetPoints)
