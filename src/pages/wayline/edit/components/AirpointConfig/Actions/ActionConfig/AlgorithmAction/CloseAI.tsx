import AppEmpty from '@/components/AppEmpty'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Radio, RadioChangeEvent, Spin } from 'antd'
import { memo, useMemo, useState, type FC } from 'react'
import AlgorithmItem from './AlgorithmItem'
import { useMemoizedFn } from 'ahooks'
import { useAppMsg } from '@/hooks/useAppMsg'
import { shouldJson } from '@/utils/json'
import { getAlgorithmList } from '@/service/modules/algorithm'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { algorithmIconMap } from '@/components/device/algorithm/AlgorithmListItem'
import IconAIDisable from '@/assets/icons/jsx/IconAIDisable'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { ActionOpenAIType } from '@/store/wayline/uav-airline/types'

type ConfigType = {
  algorithmId: number
  actionTiming: 'ARRIVE' | 'LEAVE'
}

type PropsType = {
  config: Partial<ConfigType>
  onChange: (value: Partial<ConfigType>) => unknown
}

const CloseAI: FC<PropsType> = memo(({ config, onChange }) => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['algorithmAppList', DeviceEnum.UAV],
      queryFn: () => getAlgorithmList({ deviceType: [DeviceEnum.UAV] }),
      staleTime: Infinity,
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const airpointsConfig = useAirlineConfigStore((s) => s.airpointsConfig)
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const currentActionIndex = useAirlineConfigStore((s) => s.currentActionIndex)

  /** 当前算法 */
  const activeAlgorithm = useMemo(() => {
    return data?.find((e) => e.id === config.algorithmId)
  }, [data, config.algorithmId])
  const Icon =
    algorithmIconMap[shouldJson(activeAlgorithm?.envMap)?.icon as string]

  // 筛选可以被关闭的算法
  const selected = useMemo(() => {
    const set = new Set<number>()
    for (let i = 0; i <= currentIndex; i++) {
      let h = airpointsConfig[i].actions.length
      if (i === currentIndex) {
        h = currentActionIndex
      }
      for (let j = 0; j < h; j++) {
        switch (airpointsConfig[i].actions[j].type) {
          case 'OPEN_AI':
            set.add(
              (airpointsConfig[i].actions[j] as ActionOpenAIType).config
                .algorithmId!,
            )
            break
          case 'CLOSE_AI':
            set.delete(
              (airpointsConfig[i].actions[j] as ActionOpenAIType).config
                .algorithmId,
            )
            break
        }
      }
    }
    return set
  }, [airpointsConfig, currentIndex, currentActionIndex])

  const dataOptions = useMemo(() => {
    if (!data) {
      return data
    }
    return data.filter((item) => selected.has(item.id))
  }, [data, selected])

  const [open, setOpen] = useState(false)
  const msgApi = useAppMsg()

  const [activeId, setActiveId] = useState<number | null>(null)
  const handleConfirm = useMemoizedFn(() => {
    if (!activeId) {
      msgApi.warning(
        t('wayline.waylinePoint.actions.OPEN_AI.error.noSelect.msg'),
      )
      return
    }
    setOpen(false)
    onChange({ ...config, algorithmId: activeId })
  })

  /** 处理单选框切换 */
  const handleTimingChange = useMemoizedFn((e: RadioChangeEvent) => {
    const actionTiming = e.target.value! as 'ARRIVE' | 'LEAVE'
    onChange?.({
      ...config,
      actionTiming,
    })
  })

  return (
    <div>
      <div className="mt-3 flex justify-between items-center text-fore-base">
        <div className="flex gap-2">
          <IconAIDisable />
          <span>{t('wayline.waylinePoint.actions.CLOSE_AI.title')}</span>
        </div>
        {activeAlgorithm && (
          <Button
            type="link"
            size="small"
            className="p-0 h-4 leading-4"
            onClick={() => setOpen(true)}
          >
            {t('wayline.waylinePoint.actions.OPEN_AI.select.title')}
          </Button>
        )}
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div>
            <Spin />
          </div>
        ) : activeAlgorithm ? (
          <>
            <div className="flex gap-3 items-center">
              <span className="text-fore-base">
                {t('wayline.waylinePoint.actions.OPEN_AI.timing.title')}
              </span>
              <Radio.Group
                options={[
                  {
                    label: t(
                      'wayline.waylinePoint.actions.OPEN_AI.ARRIVE.title',
                    ),
                    value: 'ARRIVE',
                  },
                  {
                    label: t(
                      'wayline.waylinePoint.actions.OPEN_AI.LEAVE.title',
                    ),
                    value: 'LEAVE',
                  },
                ]}
                value={config.actionTiming}
                onChange={handleTimingChange}
              />
            </div>
            <div className="mt-3 border border-solid border-[#37414D] rounded-[3px] p-2 flex gap-2">
              <div className="pt-0.5">
                <Icon />
              </div>
              <AlgorithmItem data={activeAlgorithm} editable={false} />
            </div>
          </>
        ) : (
          <Button
            block
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            {t('wayline.waylinePoint.actions.OPEN_AI.select.title')}
          </Button>
        )}
      </div>

      <XModal
        noPadding
        width="640px"
        title={
          <div className="flex gap-2">
            <MinusCircleOutlined />
            {t('wayline.waylinePoint.actions.OPEN_AI.select.title')}
          </div>
        }
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      >
        {dataOptions?.length === 0 ? (
          <AppEmpty />
        ) : (
          <Radio.Group
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
          >
            <div
              className="flex flex-wrap gap-3 text-sm max-h-[336px] overflow-y-auto p-3 pr-[9px]"
              style={{ scrollbarGutter: 'stable' }}
            >
              {dataOptions?.map((item) => (
                <div
                  key={item.id}
                  className="w-[300px] border border-solid border-[#37414D] p-1.5 rounded-[3px] flex"
                >
                  <div className="overflow-hidden">
                    <Radio value={item.id} />
                  </div>
                  <div className="flex-1">
                    <AlgorithmItem data={item} editable={false} />
                  </div>
                </div>
              ))}
            </div>
          </Radio.Group>
        )}
      </XModal>
    </div>
  )
})

CloseAI.displayName = 'CloseAI'

export default CloseAI
