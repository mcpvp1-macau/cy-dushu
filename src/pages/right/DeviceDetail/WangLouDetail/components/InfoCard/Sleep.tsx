import React, { useEffect, useState } from 'react'
import { Switch } from 'antd'
import { useRequest } from 'ahooks'
import styles from './Sleep.module.less'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getDeviceDetail, postDeviceService } from '@/service/modules/device'

interface Props {
  deviceId: String
}

const Sleep: React.FC<Props> = (props) => {
  const msgApi = useAppMsg()
  const [loading, setLoading] = useState(false)

  const sleepStatus = {}

  const { data, run } = useRequest(
    async (deviceId) => {
      setLoading(true)
      const res = await getDeviceDetail(deviceId)
      const { code, data } = res
      if (code === 'SUCCESS') {
        setLoading(false)
        return data.childDevice
      } else {
        //
      }
      return []
    },
    { manual: true },
  )

  const { run: change } = useRequest(
    async (checked: boolean, item: any) => {
      const { productKey, deviceId } = item
      setLoading(true)
      const res = await postDeviceService(
        productKey,
        deviceId,
        checked ? 'waken' : 'sleep',
        {},
      )
      if (res.code === 'SUCCESS') {
        //
        let timer: NodeJS.Timeout | null = setTimeout(() => {
          run(props.deviceId)
          timer && clearTimeout(timer)
          timer = null
        }, 1000)
      } else {
        //
        setLoading(false)
        msgApi.warning(res.message)
      }
    },
    { manual: true },
  )

  useEffect(() => {
    run(props.deviceId)
  }, [props.deviceId])
  return (
    <div>
      {data?.map((item) => {
        if (item.properties.sleepSwitch !== 1) return null
        const status = sleepStatus[item.deviceId] || item.properties.sleepStatus
        return (
          <div key={item.deviceId} className={styles.switch}>
            <Switch
              defaultChecked
              disabled={status === 'DESTRUCT'}
              value={status === 'WORKING'}
              size={'small'}
              onChange={(checked: boolean) =>
                status !== 'DESTRUCT' && change(checked, item)
              }
              checkedChildren="运行"
              unCheckedChildren="休眠"
              loading={loading}
            />
            <span style={{ marginLeft: 10, lineHeight: '20px' }}>
              {item.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(Sleep)
