import React from 'react'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

const InterferenceComp: React.FC<{
  requencyOfJammerList: API_DEVICE.domain.Properties['requencyOfJammerList']
}> = ({ requencyOfJammerList }) => {
  const requencyOfJammerListArray = useOthersControlRoomStore(
    (s) => s.state.requencyOfJammerList,
  )

  // mock
  // const requencyOfJammerListMock = [
  //   { startFreq: 1, terminationFreq: 2, startAngle: 20, terminationAngle:25,power: 220 },
  //   { startFreq: 3, terminationFreq: 4, startAngle: 40, terminationAngle:45, power: 220 },
  //   { startFreq: 5, terminationFreq: 6, startAngle: 60, terminationAngle:65, power: 220 },
  // ]
  const requencyOfJammerListMock = (requencyOfJammerListArray ?? requencyOfJammerList)
  return (
    <div className=''>
      {/* <div className="text-sm text-white pl-[12px]">
        干扰频点 {requencyOfJammerListMock.length}个
      </div> */}
      <div className="flex flex-col gap-2 text-xs bg-[#28323C] m-3 p-2">
        {requencyOfJammerListMock?.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-1">
              <div className="w-[2px] h-[8px] bg-[#15B371]"></div>
              干扰频段 {i + 1}
            </div>
            <div className="flex text-xs text-fore pl-[6px] flex-wrap pt-1">
              <div className="w-1/2 mb-1">起始频段：{item.startFreq}</div>
              <div className="w-1/2">终止频段：{item.terminationFreq}</div>
              <div className="w-1/2 mb-1">起始角度：{item.startAngle}</div>
              <div className="w-1/2">终止角度：{item.terminationAngle}</div>
              <div className="w-1/2">干扰功率：{item.power}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InterferenceComp
