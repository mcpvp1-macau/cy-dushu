import React from 'react'
import Control1 from './Control1'

type PropsType = {
  /** 详情数据 */
  data: API_DEVICE.domain.Device
} & Record<string, any>

const Control: React.FC<PropsType> = ({ data }) => {
  // TODO 后续在这里判断用哪种转台
  return <Control1 data={data} />
}

export default React.memo(Control)
