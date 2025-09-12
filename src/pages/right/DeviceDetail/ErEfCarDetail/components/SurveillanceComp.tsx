import React from 'react'
import { Collapse } from 'antd'
import CustomExpandIcon from '@/components/CustomExpandIcon'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

type PropsType = {
  rfList: API_DEVICE.domain.Properties['rfList']
  keyAreasList: API_DEVICE.domain.Properties['keyAreasList']
}

const SurveillanceComp: React.FC<PropsType> = ({
  rfList = [],
  keyAreasList = [],
}) => {
  const rfArray = useOthersControlRoomStore((s) => s.state.rfList)
  const keyAreasArray = useOthersControlRoomStore((s) => s.state.keyAreasList)

  // TODO MOCK数据
  const rf = rfArray ?? rfList
  // const rf = [
  //   { startFreq: 1, terminationFreq: 2 },
  //   { startFreq: 3, terminationFreq: 4 },
  //   { startFreq: 5, terminationFreq: 6 },
  // ]
  const keyAreas = keyAreasArray ?? keyAreasList
  // const keyAreas = [{ name: '侦测区域1' }]

  return (
    <div className="p-3">
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        expandIconPosition="end"
        expandIcon={CustomExpandIcon}
        className="bg-[rgba(0,0,0,0)] [&_.ant-collapse-content-box]:!p-0"
        items={[
          {
            key: '1',
            label: '侦察频段 ' + rf.length + '个',
            children: (
              <div className="flex flex-col gap-2 text-xs bg-[#28323C] my-2 p-2">
                {rf?.map((item, i) => (
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="w-[2px] h-[8px] bg-[#15B371]"></div>
                      侦察频段 {i + 1}
                    </div>
                    <div className="flex text-xs text-fore pl-[6px]">
                      <div className="w-1/2">起始频段：{item.startFreq}</div>
                      <div className="w-1/2">
                        终止频段：{item.terminationFreq}
                      </div>
                    </div>
                  </div>
                ))}{' '}
              </div>
            ),
            style: {
              border: 'none',
            },
          },
          {
            key: '2',
            label: '侦测区域 ' + keyAreas.length + '个',
            children: (
              <div className="flex flex-col gap-2 text-xs bg-[#28323C] my-2 p-2">
                {keyAreas?.map((item, i) => (
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="w-[2px] h-[8px] bg-[#15B371]"></div>
                      侦测区域 {i + 1}
                    </div>
                    <div className="flex text-xs text-fore pl-[6px]">
                      <div className="w-1/2">起始方位：{item.startAngle}</div>
                      <div className="w-1/2">
                      结束方位：{item.terminationAngle}
                      </div>
                    </div>
                  </div>
                ))}{' '}
              </div>
            ),
            style: {
              border: 'none',
            },
          },
        ]}
      />
      {/* <div className="text-sm text-white pl-[12px]">
        侦测区域 {keyAreas.length}个
      </div> */}
    </div>
  )
}

export default SurveillanceComp
