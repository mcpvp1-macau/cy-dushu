import DeviceIconCamera from "@/assets/icons/jsx/device/DeviceIconCamera"
import IconData from "@/assets/icons/jsx/IconData"
import IconDetail from "@/assets/icons/jsx/IconDetail"
import useServerEventMsg from "@/pages/control-room/uav/hooks/useServerEventMsg"
import { OthersControlRoomStoreContext, useCreateOthersControlRoomStore } from "@/store/context-store/useOthersControlRoom.store"
import React, { lazy } from "react"
import CloseableHeader from "../../components/CloseableHeader"
import { Segmented } from "antd"
import { ScrollArea } from "@/components/ui/scroll-area"
import AppViewSuspense from "@/components/AppViewSuspense"


const OthersDetailDetail = lazy(() => import('./components/OthersDetailDetail'))
const OthersDetailData = lazy(() => import('./components/OthersDetailData'))

type PropsType = {
    data: API_DEVICE.domain.Device
}


const OthersDetail: React.FC<PropsType> = ({ data }) => {
    const productKey = data.productKey || data.deviceModel?.productKey
    const deviceId = data.deviceId
    const store = useCreateOthersControlRoomStore(
        productKey!,
        deviceId,
        useServerEventMsg(),
    )

    const header = useMemo(
        () => (
            <div className="flex gap-2 items-center">
                <DeviceIconCamera className="device-detail-icon" />
                <h6 className="text-white text-base">{data.deviceName}</h6>
            </div>
        ),
        [data.deviceName],
    )

    const [tab, setTab] = useState('详情')
    const segmentOptions = useRef([
        {
            label: '详情',
            value: '详情',
            icon: <IconDetail />,
        },
        {
            label: '数据',
            value: '数据',
            icon: <IconData />,
        },
    ]).current

    return <OthersControlRoomStoreContext.Provider value={store}>
        <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
            <CloseableHeader>{header}</CloseableHeader>
            <div className="px-3 mt-1 mb-3">
                <Segmented
                    block
                    value={tab}
                    options={segmentOptions}
                    onChange={setTab}
                />
            </div>
            {/* <div className="flex-1 overflow-y-auto"> */}
            <ScrollArea className="grow">
                <AppViewSuspense>
                    {tab === '详情' ? (
                        <OthersDetailDetail />
                    ) : (
                        <OthersDetailData deviceId={deviceId} />
                    )}
                </AppViewSuspense>
            </ScrollArea>
            {/* </div> */}
        </div>
        {/* <WanglouUpdateRealMarker /> */}
    </OthersControlRoomStoreContext.Provider>
}

export default React.memo(OthersDetail)