import React from "react"
import { useDeviceDetailStore } from "../../hooks/useDeviceDetail.store"
import { useOthersControlRoomStore } from "@/store/context-store/useOthersControlRoom.store"
import OthersVideo from "./OthersVideo"
import { Link } from "react-router-dom"
import { Button } from "antd"
import IconControlRoom from "@/assets/icons/jsx/IconControlRoom"
import ControlPower from "@/components/ControlPower"
import AppCollapse from "@/components/AppCollapse"
import AppViewSuspense from "@/components/AppViewSuspense"
import InfoCard from "./InfoCard"
import Control from "./Control"
import DeviceAlgorithmList from "@/components/device/algorithm/DeviceAlgorithmList"

/** // TODO 这个每个设备类型的配置都不一样 */
const deviceConfigs = {
    /** 是否有驾驶舱 */
    isHaveControlRoom: true
}

const OthersDetailDetail: React.FC = () => {
    const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
    const deviceId = deviceDetail.deviceId
    const productKey =
        deviceDetail.productKey || deviceDetail.deviceModel?.productKey
    const videoList = deviceDetail?.properties?.videoList
    const controlTag = useOthersControlRoomStore((s) => s.state.controlTag)
    const uuid = useOthersControlRoomStore((s) => s.uuid)
    const updateUUID = useOthersControlRoomStore((s) => s.updateUUID)

    console.info('ddd------', deviceDetail)
    const childDeviceVideos = useMemo(() => {
        const arr: API_DEVICE.domain.Device[] = [];
        deviceDetail?.childDevice?.forEach(item => {
            if (item?.properties?.videoList?.length)
                arr.push(item)
        })
        return arr;
    }, [deviceDetail?.childDevice])

    console.info('ddd-22222-----', videoList)
    return <div>
        {/** 设备本身的视频 */}
        {videoList?.map(item => {
            return <section className="mx-3 my-3">
                <OthersVideo
                    deviceId={deviceId}
                    productKey={productKey!}
                    videoId={item.videoId}
                    videoName={item.name}
                />
            </section>
        })}
        {/** 子设备本身的视频 */}
        {childDeviceVideos.map(item => {
            return item.properties?.videoList?.map(video => {
                return <section className="mx-3 my-3">
                    <OthersVideo
                        deviceId={item.deviceId}
                        productKey={item.deviceModel?.productKey!}
                        videoId={video.videoId}
                        videoName={video.name}
                    />
                </section>
            })

        })}
        {deviceConfigs.isHaveControlRoom ?
            <section className="mx-3 mr-[9px] my-3 flex gap-2">
                <Link className="grow" to={`/control-room/others/${deviceId}`}>
                    <Button block className="h-7" icon={<IconControlRoom />}>
                        进入驾驶舱
                    </Button>
                </Link>
                <ControlPower
                    open={!!(uuid && uuid === controlTag)}
                    updateUUID={updateUUID}
                />
            </section> : null}


        <AppCollapse
            className="mt-3 border-x-0 border-b-0"
            defaultActiveKey={['status', 'flight']}
            items={[
                {
                    label: '设备状态',
                    key: 'status',
                    children: (
                        <AppViewSuspense>
                            <InfoCard data={deviceDetail} />
                        </AppViewSuspense>
                    ),
                },
                {
                    label: '转台控制',
                    key: 'flight',
                    children: (
                        <AppViewSuspense>
                            {/** // TODO 后续要确认一下怎么判断是否有转台控制 */}
                            <Control data={deviceDetail} />
                        </AppViewSuspense>
                    ),
                },
                {
                    label: 'AI 模型',
                    key: 'ai',
                    children: (
                        <AppViewSuspense>
                            <DeviceAlgorithmList
                                deviceType={deviceDetail.deviceType}
                                deviceId={deviceId}
                                productKey={productKey!}
                            />
                        </AppViewSuspense>
                    ),
                },
            ]}
        />
    </div>
}

export default React.memo(OthersDetailDetail)