import { getTargetDetail } from '@/service/modules/db-api'
import useRightMode from '@/store/layout/useRightMode.store'
import React from 'react'
import CloseableHeader from '../components/CloseableHeader'
import ImageOrVideo from './ImageOrVideo'
import AppCollapse from '@/components/AppCollapse'
import { infoFieldFormatter as format } from '@/utils/other/utils'
import { getProductFieldsByIdentifier } from '@/service/modules/device'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="flex gap-1">
      <div>{l}:</div>
      {v}
    </li>
  )
}

export type TargetDetailType = {
  acquireTimestampFormat: string
  altitude: number
  bboxHeight: number | null
  bboxWidth: number | null
  childDeviceId: string
  confidence: number | null
  distance: number
  imageUrl: string | null
  latitude: number
  leftTopX: number | null
  leftTopY: number | null
  longitude: number
  objectLabel: string | null
  parentId: string
  recordPath: string | null
  source: string
  sourceFrameHeight: number | null
  sourceFrameWidth: number | null
  speed: number
  targetId: string
  xDistance: number
  yDistance: number
}

const TargetDetail: React.FC = () => {
  const detailId = useRightMode((s) => s.detailId)
  const { t } = useTranslation()
  const [parentId, deviceId, targetId] =
    (String(detailId) || '')?.split('=') || []
  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: ['TargetDetail', targetId],
      queryFn: () =>
        getTargetDetail({
          parentId, //父设备id ，没有就是设备id
          deviceId, //设备id
          targetId: Number(targetId), // 目标id
          sourceType: 'RADAR',
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }),
      select: (d) => d.data?.[0] as TargetDetailType,
    },
    queryClient,
  )

  const { data: labelData, _isLoading } = useQuery(
    {
      queryKey: ['getProductFieldsByIdentifier', 'targetInfo'],
      queryFn: () =>
        getProductFieldsByIdentifier({ functionIdentifier: 'targetInfo' }),
      select: (d) => d.data.rows,
    },
    queryClient,
  )
  const labelMap = useMemo(() => {
    const map = {}
    labelData?.forEach((item) => {
      const a = item.fields.find((item) => item.identifier === 'targetType')
      if (a) {
        const s = JSON.parse(a.specs)
        if (Array.isArray(s)) {
          s.forEach((v) => {
            map[v.value] = v.label
          })
        }
      }
    })
    return map
  }, [labelData])

  const getLabel = (item) => {
    return labelMap[item?.targetType]
  }

  const renderSource = (source: string) => {
    let data: any[] = []
    try {
      data = JSON.parse(source) || []
    } catch (_error) {}

    return data.map((item) => item.deviceName).join(',')
  }

  return (
    <div className="w-[350px] flex flex-col overflow-y-hidden">
      <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
        <CloseableHeader>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              {/* <DeviceIconUAV className="device-detail-icon" /> */}
              <h6 className="text-white text-base">{t('common.target')} {targetId}</h6>
            </div>
          </div>
        </CloseableHeader>
      </div>
      {/* <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap">
        <I l="ID" v={targetId} />
        <I l="来源" v={renderSource(data?.source || '')} />
        <I l="置信度" v={data?.confidence?.toFixed(2) || '-'} />
      </ul> */}
      {data ? <ImageOrVideo data={data} /> : null}
      <AppCollapse
        defaultActiveKey={['1']}
        items={[
          {
            key: '1',
            label: t('common.props'),
            children: (
              <ul className="p-2 mx-3 my-3 mr-[9px] card-border text-sm">
                <I l={t('common.type')} v={data?.objectLabel ?? getLabel(data) ?? t('common.unknown')} />
                <I
                  l={t('common.speed')}
                  v={format({
                    value: data?.speed,
                    unit: 'm/s',
                  })}
                />
                <I
                  l={t('common.distance')}
                  v={format({
                    value: data?.distance,
                    unit: 'm',
                  })}
                />
                <I
                  l={t('common.altitude')}
                  v={format({
                    value: data?.altitude,
                    unit: 'm',
                  })}
                />
                <I
                  l={t('common.time')}
                  v={format({ value: data?.acquireTimestampFormat })}
                />
                <I
                  l={t('common.position')}
                  v={format({
                    value: [data?.longitude, data?.latitude],
                    valueFormatter(value) {
                      return Number(value).toFixed(6)
                    },
                  })}
                />
                <I l={t('common.source')} v={renderSource(data?.source || '')} />
                <I l={t('common.confidence')} v={data?.confidence?.toFixed(2) || '-'} />
              </ul>
            ),
          },
        ]}
      ></AppCollapse>
    </div>
  )
}

export default React.memo(TargetDetail)
