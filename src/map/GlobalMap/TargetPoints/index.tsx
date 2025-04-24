import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import React, { ComponentRef } from 'react'
import { PointPrimitive, PointPrimitiveCollection } from 'resium'
import * as Cesium from 'cesium'
// import useRightMode from '@/store/layout/useRightMode.store'
// import { RightModeEnum } from '@/enum/right-mode'
import useBoardObjStore from '@/store/map/useBoardObj.store'
import PositionMenu from '@/components/map/PositionMenu'
import DispatchModal from './components/DispatchModal'

export const sourceTypeColorMap: Record<string, string> = {
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

  const menuRef = useRef<ComponentRef<typeof PositionMenu>>(null)
  const [menuPosition, setMenuPosition] = useState<number[]>([0, 0])
  const [dispatchOpen, setDispatchOpen] = useState(false)

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
                }--${parentId}--${deviceId}--${item.sourceType}--${i}--${
                  item.uploadMode
                }`
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
                      onRightClick={() => {
                        setMenuPosition([lng, lat, alt])
                        menuRef.current?.open()
                      }}
                    />
                  </React.Fragment>
                )
              })
            })
          })
        })}
        {/* 下面的代码 MOCK 测试用的 */}
        {/* <PointPrimitive
          color={Cesium.Color.fromCssColorString('#fff')}
          position={Cesium.Cartesian3.fromDegrees(120, 30, 0)}
          pixelSize={14}
          disableDepthTestDistance={50000}
          outlineColor={Cesium.Color.fromCssColorString('#fff')}
          outlineWidth={1.5}
          // onClick={() => onClick(`${parentId}=${deviceId}=${id}`)}
          onRightClick={() => {
            menuRef.current?.open()
            setMenuPosition([120, 30, 0])
          }}
        /> */}
      </PointPrimitiveCollection>
      <PositionMenu
        ref={menuRef}
        position={menuPosition}
        menu={{
          items: [
            {
              key: 0,
              label: '派遣',
              onClick: () => {
                setDispatchOpen(true)
                menuRef.current?.close()
              },
            },
          ],
        }}
      />
      {dispatchOpen && (
        <DispatchModal
          open={dispatchOpen}
          position={menuPosition}
          onClose={() => setDispatchOpen(false)}
        />
      )}
    </>
  )
}

export default React.memo(TargetPoints)
