import { Segmented } from 'antd'
import useBackTrackingInfo from '../../hooks/useBackTrackingInfo'
import WanglouBackTrackingDetail from './WanglouDetail'
import WangLouDetailMarker from './WangLouDetailMarker'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import DeviceIconWANGLOU from '@/assets/icons/jsx/device/DeviceIconWANGLOU'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppViewSuspense from '@/components/AppViewSuspense'
import BacktrackingDetailData from '../BacktrackingDetailData'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const WanglouBackTracking: React.FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data
  const curAttr = useBackTrackingInfo(deviceId)
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  
  return (
    <>
      <div className="w-[350px]">
        <div className="flex justify-between px-3 my-2">
          <div className="flex gap-2 items-center">
            <DeviceIconWANGLOU className="device-detail-icon" />
            <h6 className="text-white text-base">{data.deviceName}</h6>
          </div>
        </div>

        <div className="px-3 mt-1 mb-3">
          <Segmented
            block
            value={tab}
            options={[
              {
                label: t('common.detail'),
                value: 0,
                icon: <IconDetail />,
              },
              {
                label: t('common.data'),
                value: 1,
                icon: <IconData />,
              },
            ]}
            onChange={setTab}
          />
        </div>

        <ScrollArea className="grow">
          <AppViewSuspense>
            {tab === 0 ? (
              <WanglouBackTrackingDetail
                data={data}
                curAttr={curAttr}
                updateTime={
                  (curAttr?.acquireTimestampFormat &&
                    dayjs(curAttr?.acquireTimestampFormat).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )) ||
                  '-'
                }
              />
            ) : (
              <BacktrackingDetailData deviceId={deviceId} deviceDetail={data} />
            )}
          </AppViewSuspense>
        </ScrollArea>
      </div>

      <WangLouDetailMarker data={data} curAttr={curAttr} />


      {/* <BoardCesium /> */}
    </>
  )
})

export default WanglouBackTracking
