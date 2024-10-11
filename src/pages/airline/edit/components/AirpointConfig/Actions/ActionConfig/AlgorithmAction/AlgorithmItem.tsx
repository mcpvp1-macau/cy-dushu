import IconSetting from '@/assets/icons/jsx/IconSetting'
import AlgorithmSettingModal from '@/components/device/algorithm/AlgorithmSettingModal'
import IconButton from '@/components/ui/button/IconButton'
import { useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { memo, useState, type FC } from 'react'

type PropsType = {
  data: API_Alogrithm.domain.AlgorithmRecord
  /** 算法配置 */
  config?: Record<string, any>
  /** 是否允许编辑 */
  editable?: boolean
  onConfigChange?: (value: Record<string, any>) => void
}

const AlgorithmItem: FC<PropsType> = memo(
  ({ data, config, editable = true, onConfigChange }) => {
    const [settingOpen, setSettingOpen] = useState(false)

    const handleConfirm = useMemoizedFn((v: Record<string, any>) => {
      onConfigChange?.(v)
      setSettingOpen(false)
    })

    return (
      <div className="flex-1 flex flex-col items-stretch">
        <div className="h-[22px] text-white flex items-center gap-2">
          <span>{data.name}</span>
          {editable && (
            <IconButton onClick={() => setSettingOpen(true)}>
              <IconSetting />
            </IconButton>
          )}
        </div>
        <div className="flex flex-wrap mt-1 text-xs text-fore-base gap-y-1 overflow-hidden whitespace-nowrap">
          <div className="w-1/2 flex gap-1">
            <span>状态:</span>
            <span>{data.status === 'USED' ? '使用中' : '未使用'}</span>
          </div>
          <div className="w-1/2 flex gap-1">
            <span>来源:</span>
            <span>-</span>
          </div>
          <div className="w-1/2 flex gap-1">
            <span>创建时间:</span>
            <span>{dayjs(data.createTime).format('YYYY-MM-DD')}</span>
          </div>
          {data.algorithmConfigList?.map((v) => (
            <div className="w-1/2 flex gap-1 overflow-hidden" key={v.property}>
              <span>{v.propertyName}:</span>
              <span className="truncate">
                {Array.isArray(config?.[v.property])
                  ? config?.[v.property].join(',')
                  : config?.[v.property] || '-'}
              </span>
            </div>
          ))}
        </div>
        {settingOpen && (
          <AlgorithmSettingModal
            open={settingOpen}
            aiData={data}
            alogorithmConfig={config}
            onClose={() => setSettingOpen(false)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    )
  },
)

AlgorithmItem.displayName = 'AlgorithmItem'

export default AlgorithmItem
