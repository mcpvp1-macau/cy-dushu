import SmartCarVideoWall, { type SmartCarVideoItem } from './SmartCarVideoWall'

type PropsType = {
  deviceDetail?: API_DEVICE.domain.Device | null
  videoItems: SmartCarVideoItem[]
  selectedVideoIds: string[]
  onSelectedChange: (nextIds: string[]) => void
  gimbalDevice?: API_DEVICE.domain.Device | null
}

const SmartCarVideoPanel: FC<PropsType> = memo(
  ({ deviceDetail, videoItems, selectedVideoIds, onSelectedChange }) => {
    const { t } = useTranslation()

    return (
      <div className="flex size-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">
          {/* 边界情况：设备详情未就绪时隐藏视频区域内容。 */}
          {deviceDetail ? (
            <SmartCarVideoWall
              videoItems={videoItems}
              selectedIds={selectedVideoIds}
              onSelectedChange={onSelectedChange}
            />
          ) : (
            <div className="p-3 text-sm text-fore-2">
              {t('controlRoom.smartCar.noVideo', {
                defaultValue: '暂无视频',
              })}
            </div>
          )}
        </div>
      </div>
    )
  },
)

SmartCarVideoPanel.displayName = 'SmartCarVideoPanel'

export default SmartCarVideoPanel
