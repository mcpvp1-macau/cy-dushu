import { type ButtonHTMLAttributes, memo, type FC, useRef } from 'react'
import { useDebounceEffect, useMemoizedFn } from 'ahooks'
import { Slider, SliderSingleProps } from 'antd'
import dayjs from 'dayjs'
import GeoQuickSearch from '@/utils/geo-quick-search'
import { signalStrParseWithLngLat } from '@/utils/signal-parse'
import { sortSearchFn } from '@/utils/sort'
import axios, { CancelTokenSource } from 'axios'
import useWirelessSituationStore from '@/store/map/useSignalLayer.store'
import IconWireless from '@/assets/icons/jsx/IconWireless'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { getWirelessSituation } from '@/service/modules/db-api'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import SignalExample from './SampleExample'
import BottomSafeAreaPortal from '@/components/map/BottomSafeAreaPortal'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement>

const splitValues = '50-80-100-120-140-160-180-200-250-300-350-400'
const lines = splitValues.split('-').length - 1
const linesWidth = 100
const high = lines * linesWidth

/** 伪造数据, 目的是为了将 marks 能平均分布 */
const faker = '50-80-100-120-140-160-180-200-250-300-350-400'
  .split('-')
  .map((v, i) => [Number(i * linesWidth), Number(v)])

const marks: SliderSingleProps['marks'] = Object.fromEntries(
  faker.map((v, i) => [Number(i * linesWidth), `${v[1]}m`]),
)

/** 计算真值 */
const calcTruthValue = (v: number) => {
  const idx = sortSearchFn(faker, (e) => v >= e[0])
  if (idx + 1 === faker.length) {
    return faker[idx][1]
  }
  return Math.floor(
    faker[idx][1] +
      (faker[idx + 1][1] - faker[idx][1]) * ((v % linesWidth) / linesWidth),
  )
}

/** 信号控制器 */
const WirelessSituationTool: FC<PropsType> = memo((props) => {
  const enableSignalLayer = useWirelessSituationStore(
    (s) => s.enableSignalLayer,
  )
  const updateEnableSignalLayer = useWirelessSituationStore(
    (s) => s.updateEnableSignalLayer,
  )
  const range = useWirelessSituationStore((s) => s.range)
  const updateRange = useWirelessSituationStore((s) => s.updateRange)
  const {
    updateLevelData,
    updateLevelDataByLevel,
    updateCeilMap,
    updateCeilMapAppend,
    updateLevelGQSByLevel,
    updateLevelGQS,
  } = useWirelessSituationStore((s) => ({
    updateLevelData: s.updateLevelData,
    updateLevelDataByLevel: s.updateLevelDataByLevel,
    updateCeilMap: s.updateCeilMap,
    updateCeilMapAppend: s.updateCeilMapAppend,
    updateLevelGQSByLevel: s.updateLevelGQSByLevel,
    updateLevelGQS: s.updateLevelGQS,
  }))

  const { t } = useTranslation()

  const handleClick = useMemoizedFn(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      updateEnableSignalLayer(!enableSignalLayer)
      props.onClick?.(e)
    },
  )

  const cancelTokenRef = useRef<CancelTokenSource | null>(null)

  const fetchSignalData = useMemoizedFn(async (level: number) => {
    try {
      const { data } = await getWirelessSituation(
        {
          minHeight: calcTruthValue(range[0]),
          maxHeight: calcTruthValue(range[1]),
          startTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00'),
          endTime: dayjs().format('YYYY-MM-DD 00:00:00'),
          level,
        },
        {
          cancelToken: cancelTokenRef.current?.token,
        },
      )
      if (data) {
        updateLevelDataByLevel(level, data)
        const gqsData: any = []
        const record = Object.fromEntries(
          data.map(({ E: item }) => {
            gqsData.push(signalStrParseWithLngLat(item))
            return [item.slice(0, item.indexOf(',')), item]
          }),
        )
        updateCeilMapAppend(record)
        if (level > 10) {
          const gqs = new GeoQuickSearch(gqsData)
          gqs.init('lng', 'lat')
          updateLevelGQSByLevel(level, gqs)
        }
      }
    } catch (e) {}
  })

  useDebounceEffect(
    () => {
      cancelTokenRef.current?.cancel()
      cancelTokenRef.current = axios.CancelToken.source()
      updateLevelData({})
      updateCeilMap({})
      updateLevelGQS({})
      if (enableSignalLayer) {
        for (let i = 7; i <= 13; i++) {
          fetchSignalData(i)
        }
      }
    },
    [range, enableSignalLayer],
    {
      wait: 500,
    },
  )

  return (
    <>
      <FloatIconButton
        tippyProps={{ content: t('signalSituation.title'), placement: 'left' }}
        onClick={handleClick}
        active={enableSignalLayer}
      >
        <IconWireless />
      </FloatIconButton>
      {enableSignalLayer && (
        <>
          <div
            className={clsx(
              'p-3 absolute top-0 right-11 w-[144px] bg-ground-1 bg-opacity-90 backdrop-blur',
              'flex flex-col gap-3',
              'border border-solid border-ground-4 rounded-[3px]',
            )}
          >
            <div className="flex flex-nowrap gap-3 items-center justify-between">
              <h5 className="text-base text-hightlight">
                {t('signalSituation.heightFilter.title')}
              </h5>
              <IconButton onClick={() => updateEnableSignalLayer(false)}>
                <IconClose
                  style={{ fontSize: '16px', transform: 'scale(1.3)' }}
                />
              </IconButton>
            </div>
            <div>
              <Slider
                vertical
                range
                marks={marks}
                tooltip={{
                  formatter: (v) => {
                    if (!v) {
                      return '50m'
                    }
                    return `${calcTruthValue(v)}m`
                  },
                }}
                style={{ height: 300 }}
                min={0}
                max={high}
                value={range}
                onChange={([l, h]) => updateRange(l, h)}
              />
            </div>
          </div>
          <BottomSafeAreaPortal>
            <SignalExample />
          </BottomSafeAreaPortal>
        </>
      )}
    </>
  )
})

WirelessSituationTool.displayName = 'SignalController'

export default WirelessSituationTool
