import { memo, useEffect, useMemo, useState, type FC } from 'react'
import { Button, Radio, RadioChangeEvent, Spin } from 'antd'
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AppEmpty from '@/components/AppEmpty'
import AlgorithmItem from './AlgorithmItem'
import { useMemoizedFn } from 'ahooks'
import { useAppMsg } from '@/hooks/useAppMsg'
import { shouldJson } from '@/utils/json'
import { algorithmIconMap } from '@/components/device/algorithm/AlgorithmListItem'
import IconAIEnable from '@/assets/icons/jsx/IconAIEnable'
import XModal from '@/components/XModal'
import { getAlgorithmList } from '@/service/modules/algorithm'
import { DeviceEnum } from '@/enum/device'
import { ScrollArea } from '@/components/ui/scroll-area'

type ConfigType = {
  algorithmId: number
  actionTiming: 'ARRIVE' | 'LEAVE'
  algorithmConfig: Record<string, any>
  algorithmData?: Record<string, any>
}

type PropsType = {
  config: Partial<ConfigType>
  onChange: (value: Partial<ConfigType>) => unknown
}

const OpenAI: FC<PropsType> = memo(({ config, onChange }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

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

  /** 当前算法 */
  const activeAlgorithm = useMemo(() => {
    return data?.find((e) => e.id === config.algorithmId)
  }, [data, config.algorithmId])
  const Icon =
    algorithmIconMap[shouldJson(activeAlgorithm?.envMap)?.icon as string]

  // 当前算法配置同步至算法配置
  useEffect(() => {
    if (!activeAlgorithm) {
      return
    }
    handleConfigChange(activeAlgorithm.id, config.algorithmConfig ?? {})
  }, [config, activeAlgorithm])

  /** 算法配置 */
  const [algorithmConfigMap, setAlgorithmConfigMap] = useState<
    Record<number, Record<string, any>>
  >({})

  /** 算法配置确认 */
  const handleConfigChange = useMemoizedFn(
    (id: number, data: Record<string, any>) => {
      setAlgorithmConfigMap({
        ...algorithmConfigMap,
        [id]: data,
      })
    },
  )

  // 选择算法确认
  const msgApi = useAppMsg()
  const [activeId, setActiveId] = useState<number | null>(null)
  const handleConfirm = useMemoizedFn(() => {
    if (!activeId) {
      msgApi.warning(
        t('wayline.waylinePoint.actions.OPEN_AI.error.noSelect.msg'),
      )
      return
    }
    onChange({
      ...config,
      algorithmId: activeId,
      algorithmConfig: algorithmConfigMap[activeId] ?? {},
      algorithmData: data?.find((e) => e.id === activeId),
    })
    setOpen(false)
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
          <IconAIEnable />
          <span>{t('wayline.waylinePoint.actions.OPEN_AI.title')}</span>
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
          <div className="text-center">
            <Spin />
          </div>
        ) : activeAlgorithm ? (
          // 存在算法
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
            <div className="mt-3 border border-solid border-ground-5 rounded-[3px] p-2 flex gap-2">
              <div className="pt-0.5">
                <Icon />
              </div>
              <AlgorithmItem
                data={activeAlgorithm}
                config={config.algorithmConfig ?? {}}
                onConfigChange={(e) => {
                  onChange({
                    ...config,
                    algorithmId: activeAlgorithm.id,
                    algorithmConfig: e ?? {},
                    algorithmData: activeAlgorithm,
                  })
                }}
              />
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

        {/* 算法选择 对话框 */}
        <XModal
          noPadding
          width="640px"
          title={
            <div className="flex gap-2">
              <PlusCircleOutlined />
              {t('wayline.waylinePoint.actions.OPEN_AI.select.title')}
            </div>
          }
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        >
          {data?.length === 0 ? (
            <AppEmpty />
          ) : (
            <Radio.Group
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
            >
              <ScrollArea className="mb-3">
                <div
                  className="flex flex-wrap gap-3 text-sm max-h-[400px] p-3"
                  style={{ scrollbarGutter: 'stable' }}
                >
                  {data?.map((item) => (
                    <div
                      key={item.id}
                      className="w-[300px] border border-solid border-ground-5 p-1.5 rounded-[3px] flex"
                    >
                      <div className="overflow-hidden">
                        <Radio value={item.id} />
                      </div>
                      <div className="flex-1">
                        <AlgorithmItem
                          data={item}
                          config={algorithmConfigMap[item.id] ?? {}}
                          onConfigChange={(e) => handleConfigChange(item.id, e)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Radio.Group>
          )}
        </XModal>
      </div>
    </div>
  )
})

OpenAI.displayName = 'OpenAI'

export default OpenAI
