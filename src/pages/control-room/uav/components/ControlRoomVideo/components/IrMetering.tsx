import DrawBox from '@/components/DrawBox'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useThrottleFn } from 'ahooks'
import { isNil } from 'lodash'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

const getColor = (temperature?: number) => {
  if (isNil(temperature)) {
    return '#242e37'
  }
  if (temperature < 0) {
    return '#3565a9'
  }
  if (temperature < 10) {
    return '#0a6640'
  }
  if (temperature < 20) {
    return '#a67908'
  }
  if (temperature < 30) {
    return '#a66321'
  }
  return '#a82a2a'
}

const IrMetering: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const { irMeteringMode, irMeteringPoint, irMeteringArea } =
    useUavControlRoomStore(
      useShallow((s) => ({
        irMeteringMode: s.state.irMeteringMode,
        irMeteringPoint: s.state.irMeteringPoint,
        irMeteringArea: s.state.irMeteringArea,
      })),
    )

  const postDeviceService = usePostDeviceService()

  const { run: handleClick } = useThrottleFn(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = e.nativeEvent.offsetX / e.currentTarget.clientWidth
      const y = e.nativeEvent.offsetY / e.currentTarget.clientHeight
      postDeviceService('irMeteringPointSet', { x, y })
    },
    {
      wait: 500,
    },
  )

  return (
    <div className="asbolute inset-0 text-xs text-white">
      {/* 点位测温 */}
      {irMeteringMode === 'POINT' && (
        <>
          {!isNil(irMeteringPoint) && (
            <div>
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded px-1 flex justify-center items-center"
                style={{
                  top: `${irMeteringPoint.y * 100}%`,
                  left: `${irMeteringPoint.x * 100}%`,
                  backgroundColor: getColor(irMeteringPoint.temperature),
                }}
              >
                <span className="whitespace-nowrap">
                  {irMeteringPoint.temperature?.toFixed?.(1) || '-'} ℃
                </span>
              </div>
            </div>
          )}
          <div
            className="absolute inset-0 pointer-events-auto cursor-pointer"
            onClick={handleClick}
          />
        </>
      )}
      {/* 区域测温 */}
      {irMeteringMode === 'AREA' && (
        <>
          {!isNil(irMeteringArea) && (
            <div
              className="absolute border-2 border-red-500/60 flex justify-center items-center"
              style={{
                top: `${irMeteringArea.y * 100}%`,
                left: `${irMeteringArea.x * 100}%`,
                width: `${irMeteringArea.width * 100}%`,
                height: `${irMeteringArea.height * 100}%`,
              }}
            >
              <div
                className="p-1 rounded whitespace-nowrap"
                style={{
                  backgroundColor: getColor(irMeteringArea.averTemperature),
                }}
              >
                {t('common.average')}:{' '}
                {irMeteringArea.averTemperature?.toFixed?.(1) || '-'} ℃
              </div>
            </div>
          )}
          {!isNil(irMeteringArea.minTemperaturePoint) && (
            <div
              className="absolute bg-red-800/90 p-1 rounded whitespace-nowrap -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${irMeteringArea.minTemperaturePoint.y * 100}%`,
                left: `${irMeteringArea.minTemperaturePoint.x * 100}%`,
                backgroundColor: getColor(
                  irMeteringArea.minTemperaturePoint.temperature,
                ),
              }}
            >
              {t('common.lowest')}:{' '}
              {irMeteringArea.minTemperaturePoint.temperature?.toFixed?.(1) ||
                '-'}{' '}
              ℃
            </div>
          )}
          {!isNil(irMeteringArea.maxTemperaturePoint) && (
            <div
              className="absolute bg-red-800/90 p-1 rounded whitespace-nowrap -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${irMeteringArea.maxTemperaturePoint.y * 100}%`,
                left: `${irMeteringArea.maxTemperaturePoint.x * 100}%`,
                backgroundColor: getColor(
                  irMeteringArea.maxTemperaturePoint.temperature,
                ),
              }}
            >
              {t('common.highest')}:{' '}
              {irMeteringArea.maxTemperaturePoint.temperature?.toFixed?.(1) ||
                '-'}{' '}
              ℃
            </div>
          )}
          <DrawBox
            onDrawEnd={([x1, y1, x2, y2]) => {
              postDeviceService('irMeteringAreaSet', {
                x: x1,
                y: y1,
                width: x2 - x1,
                height: y2 - y1,
              })
            }}
          />
        </>
      )}
    </div>
  )
})

IrMetering.displayName = 'IrMetering'

export default IrMetering
