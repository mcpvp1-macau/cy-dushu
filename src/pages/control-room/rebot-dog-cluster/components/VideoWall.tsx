import { memo, useMemo, useState, type FC } from 'react'
import { Button, Checkbox, Empty, Tag, Tooltip } from 'antd'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import AddRobotDogDrawer from './AddRobotDogDrawer'
import { useRebotDogClusterStore } from '@/store/control-room/useRebotDogCluster.store'
import { useLocalStorageState } from 'ahooks'
import Select from '@/components/AntdOverride/Select'

const VideoWall: FC = memo(() => {
  const dogs = useRebotDogClusterStore((s) => s.dogs)
  const selectedIds = useRebotDogClusterStore((s) => s.selectedIds)
  const toggleSelect = useRebotDogClusterStore((s) => s.toggleSelect)
  const removeDog = useRebotDogClusterStore((s) => s.removeDog)
  const clearSelection = useRebotDogClusterStore((s) => s.clearSelection)
  const dogStates = useRebotDogClusterStore((s) => s.dogStates)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const selectedCount = useMemo(() => selectedIds.length, [selectedIds])
  const [columns, setColumns] = useLocalStorageState<number>(
    'robotDogClusterColumns',
    { defaultValue: 3 },
  )
  const columnCount = Math.min(3, Math.max(1, columns ?? 3))

  return (
    <aside className="h-full w-full border-r border-ground-5 bg-ground-1/60 backdrop-blur flex flex-col min-w-[320px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ground-5 shrink-0">
        <div>
          <p className="font-medium">机器狗列表</p>
          <p className="text-xs opacity-70">视频常开，便于快速切换</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 text-xs">
            <span>每行</span>
            <Select
              size="small"
              value={columnCount}
              style={{ width: 70 }}
              onChange={(v) => setColumns(v)}
              options={[
                { value: 1, label: '1 个' },
                { value: 2, label: '2 个' },
                { value: 3, label: '3 个' },
              ]}
            />
          </div>
          <Button size="small" onClick={() => setDrawerOpen(true)} type="primary">
            添加
          </Button>
          <Button
            size="small"
            disabled={selectedCount === 0}
            onClick={clearSelection}
          >
            取消选中
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {dogs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Empty description="尚未添加机器狗" />
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {dogs.map((dog) => {
              const selected = selectedIds.includes(dog.deviceId)
              const state = dogStates[dog.deviceId]
              const lat = state?.latitude
              const lng = state?.longitude
              const hasCoord =
                typeof lat === 'number' && typeof lng === 'number'
              return (
                <div
                  key={dog.deviceId}
                  className="rounded border border-ground-5 bg-ground-1/70 overflow-hidden shadow-sm min-w-0"
                >
                  <div className="flex items-center justify-between px-3 py-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Checkbox
                        checked={selected}
                        onChange={() => toggleSelect(dog.deviceId)}
                      />
                      <div className="min-w-0">
                        <p className="font-medium leading-tight truncate">
                          {dog.deviceName}
                        </p>
                        <p className="text-[11px] opacity-70 leading-tight truncate">
                          {dog.deviceId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasCoord && (
                        <Tag color="blue" className="text-xs">
                          {lat!.toFixed(5)}, {lng!.toFixed(5)}
                        </Tag>
                      )}
                      <Tooltip title="移出驾驶舱">
                        <IconButton onClick={() => removeDog(dog.deviceId)}>
                          <IconDelete />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="aspect-video bg-black relative">
                    {dog.videoId ? (
                      <DeviceLiveVideo
                        deviceId={dog.deviceId}
                        productKey={dog.productKey}
                        videoId={dog.videoId}
                        useDing={false}
                        useVideoQualityCheck={{ open: true }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-fore/70 text-sm">
                        暂无视频流
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <AddRobotDogDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </aside>
  )
})

VideoWall.displayName = 'VideoWall'

export default VideoWall
