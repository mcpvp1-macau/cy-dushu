import { useRequest } from 'ahooks'
import { Flex, Switch } from 'antd'
import React from 'react'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

interface Props {
  productKey: string
  deviceId: string
  status: 'open' | 'close'
}
const RadarVisLink: React.FC<Props> = (props) => {
  const { productKey, deviceId, status } = props
  const post = usePostDeviceService(productKey, deviceId)
  const { loading, run } = useRequest(
    async (status: 'open' | 'close') => {
      await post('gangedSwitch', {
        gangedSwitch: status,
      })
    },
    { manual: true },
  )

  const onSwitchChange = (checked: boolean) => {
    if (checked) {
      run('open')
    } else {
      run('close')
    }
  }

  const { t } = useTranslation()

  return (
    <Flex gap={6} align="center" onClick={(e) => e.stopPropagation()}>
      {t('common.autoVideoRadar')}
      <Switch
        size="small"
        checked={status === 'open'}
        loading={loading}
        onChange={onSwitchChange}
      />
    </Flex>
  )
}

export default React.memo(RadarVisLink)
