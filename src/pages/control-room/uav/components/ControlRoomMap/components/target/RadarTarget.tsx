import { Fragment, memo, type FC } from 'react'
import { PointPrimitive, PointPrimitiveCollection, useCesium } from 'resium'
import * as Cesium from 'cesium'
import useControlRoomTargetInfoStore from '@/store/control-room/useTargetInfo.store'
import styles from './RadarTarget.module.less'
import dayjs from 'dayjs'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'

const sourceTypeColorMap: Record<string, string> = {
  RADAR: '#14CCBD',
  FUSION: '#4C90F0',
}

type PropsType = unknown

/** 雷达目标们 */
const RadarTargets: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const targetsRecord = useControlRoomTargetInfoStore((s) => s.targetsRecord)
  return (
    <>
      <PointPrimitiveCollection>
        {Object.values(targetsRecord).map((targets) => {
          const n = targets.length
          return targets.map((item, i) => {
            const isLast = i === n - 1
            const lng = Number(item.targetLongitude)
            const lat = Number(item.targetLatitude)
            const alt = Number(item.targetAltitude)
            const tid = `radartarget-${isLast ? 'last' : 'nor'}-${
              item.targetId
            }-${item.sourceType}-${i}`
            return (
              <Fragment key={tid}>
                <PointPrimitive
                  id={tid}
                  color={Cesium.Color.fromCssColorString(
                    isLast
                      ? sourceTypeColorMap[item.sourceType] ?? '#3855AE'
                      : '#3855AE',
                  )}
                  position={Cesium.Cartesian3.fromDegrees(lng, lat, alt)}
                  pixelSize={isLast ? 14 : 5}
                  disableDepthTestDistance={50000}
                  outlineColor={Cesium.Color.fromCssColorString('#fff')}
                  outlineWidth={isLast ? 1.5 : 0}
                />
              </Fragment>
            )
          })
        })}
      </PointPrimitiveCollection>
      {viewer &&
        Object.values(targetsRecord).map((targets) => {
          const t = targets.at(-1)!
          const lng = Number(t.targetLongitude)
          const lat = Number(t.targetLatitude)
          const height = Number(t.targetAltitude)
          const tiemstamp = t.timestamp
          return (
            <BoardMarker3D
              id="sb"
              map={viewer}
              lng={lng}
              lat={lat}
              height={height}
            >
              <div className={styles.radarTarget}>
                <div className={styles.head}>
                  Id:
                  {t.targetId} {t.targetType}
                </div>
                <div className={styles.line}>
                  <div style={{ width: 160 }}>
                    <span className={styles.label}>类型</span> {'-'}
                  </div>
                  <div>
                    <span className={styles.label}>型号</span> {t.targetType}
                  </div>
                </div>
                <div className={styles.line}>
                  <div style={{ width: 160 }}>
                    <span className={styles.label}>位置</span> {lng?.toFixed(5)}
                    , {lat?.toFixed(5)}
                  </div>
                  <div>
                    <span className={styles.label}>海拔</span>{' '}
                    {t.targetAltitude} m
                  </div>
                </div>
                <div>
                  <span className={styles.label}>时间</span>{' '}
                  {tiemstamp
                    ? dayjs(tiemstamp).format('YYYY-MM-DD hh:mm:ss')
                    : '-'}
                </div>
              </div>
            </BoardMarker3D>
          )
        })}
    </>
  )
})

export default RadarTargets
