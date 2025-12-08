import { memo, useMemo, useState, type FC } from 'react'
import { Drawer, Input } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounceFn, useMemoizedFn, useRequest } from 'ahooks'
import SourceTree from '@/pages/situation/source/components/SourceTree'
import SourceStatusCheckGroup from '@/pages/situation/source/components/SourceStatusCheckGroup'
import { DeviceEnum } from '@/enum/device'
import { getDeviceDetail, getDeviceTree } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
import { useRebotDogClusterStore } from '@/store/control-room/useRebotDogCluster.store'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useTranslation } from 'react-i18next'

type PropsType = {
  open: boolean
  onClose?: () => void
}

const AddRobotDogDrawer: FC<PropsType> = memo(({ open, onClose }) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const msgApi = useAppMsg()

  const dogs = useRebotDogClusterStore((s) => s.dogs)
  const addDog = useRebotDogClusterStore((s) => s.addDog)

  const existsIds = useMemo(
    () => new Set(dogs.map((d) => d.deviceId)),
    [dogs],
  )

  const qc = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery(
    {
      enabled: open,
      queryKey: ['robotDogClusterTree', name],
      queryFn: () =>
        getDeviceTree({
          type: DeviceEnum.ROBOT_DOG,
          name: name || undefined,
        }),
      select: (data) => data?.data,
    },
    qc,
  )

  const { runAsync: fetchDetail, loading: adding } = useRequest(
    async (device: API_DEVICE.domain.Device) => {
      const res = await getDeviceDetail(device.deviceId)
      return res.data
    },
    { manual: true },
  )

  const handleAdd = useMemoizedFn(async (device: API_DEVICE.domain.Device) => {
    if (existsIds.has(device.deviceId)) {
      msgApi?.warning?.('该设备已在驾驶舱')
      return
    }
    try {
      const detail = await fetchDetail(device)
      const productKey =
        detail.productKey ||
        detail.deviceModel?.productKey ||
        device.productKey ||
        device.deviceModel?.productKey

      if (!productKey) {
        msgApi?.error?.('无法获取设备产品信息')
        return
      }

      const videoId =
        detail.properties?.videoList?.[0]?.videoId || detail.videos?.[0]?.videoId

    addDog(
      {
        deviceId: device.deviceId,
        deviceName: detail.deviceName || device.deviceName,
        productKey,
          videoId,
        },
        detail.properties,
    )
    msgApi?.success?.('已加入驾驶舱')
    onClose?.()
  } catch (_error) {
    msgApi?.error?.('添加设备失败')
  }
})

  const { run: debouncedSetName } = useDebounceFn(
    (value: string) => {
      setName(value)
    },
    { wait: 500 },
  )

  return (
    <Drawer
      width={420}
      title={t('common.add') + '机器狗'}
      open={open}
      destroyOnClose
      onClose={onClose}
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4">
          <Input
            allowClear
            placeholder={t('source.input.placeholder')}
            onChange={(e) => debouncedSetName(e.currentTarget.value)}
          />
        </div>
        <SourceStatusCheckGroup className="px-4 py-2" />
        <div className="flex-1 overflow-hidden">
          {data ? (
            <SourceTree
              isLoading={isLoading || isRefetching || adding}
              data={data}
              onDeviceItemClick={handleAdd}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AppSpin />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
})

AddRobotDogDrawer.displayName = 'AddRobotDogDrawer'

export default AddRobotDogDrawer
