import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import IconButton from '@/components/ui/button/IconButton'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import { Fragment } from 'react/jsx-runtime'

export type SmartCarVideoItem = {
  id: string
  label: string
  deviceId: string
  productKey: string
  videoId: string
}

type PropsType = {
  videoItems: SmartCarVideoItem[]
  selectedIds: string[]
}

const SmartCarVideoWall: FC<PropsType> = memo(({ videoItems, selectedIds }) => {
  const videoIdMap = useMemo(() => {
    const map = new Map<string, SmartCarVideoItem>()
    videoItems.forEach((item) => {
      map.set(item.id, item)
    })
    return map
  }, [videoItems])

  const allIds = useMemo(() => videoItems.map((item) => item.id), [videoItems])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCount = selectedIds.length

  const gridSize = useMemo(() => {
    if (selectedCount <= 1) {
      return 1
    }
    if (selectedCount <= 4) {
      return 2
    }
    return 3
  }, [selectedCount])

  const slotCount = gridSize * gridSize

  const [slotVideoIds, setSlotVideoIds] = useState<string[]>([])

  useEffect(() => {
    if (slotCount === 0) {
      setSlotVideoIds([])
      return
    }
    setSlotVideoIds((prev) => {
      const next = Array.from({ length: slotCount }, (_, index) => {
        const prevId = prev[index]
        if (prevId && selectedSet.has(prevId)) {
          return prevId
        }
        return selectedIds[index] ?? ''
      })
      return next
    })
    // 业务规则：选中项变化时，优先保留已选中的分块视频。
  }, [selectedIds, selectedSet, slotCount])

  const getNextSelectedId = useMemoizedFn(
    (currentId: string | undefined, step: number) => {
      if (!allIds.length || selectedSet.size === 0) {
        return ''
      }

      let currentIndex = currentId ? allIds.indexOf(currentId) : -1
      if (currentIndex === -1) {
        currentIndex = step > 0 ? -1 : 0
      }

      for (let i = 0; i < allIds.length; i += 1) {
        const nextIndex = (currentIndex + step + allIds.length) % allIds.length
        const nextId = allIds[nextIndex]
        currentIndex = nextIndex
        if (selectedSet.has(nextId)) {
          return nextId
        }
      }

      return currentId ?? ''
    },
  )

  const handleSwitch = useMemoizedFn((slotIndex: number, step: number) => {
    setSlotVideoIds((prev) => {
      const currentId = prev[slotIndex]
      const nextId = getNextSelectedId(currentId, step)

      if (!nextId || currentId === nextId) {
        return prev
      }

      const next = [...prev]
      next[slotIndex] = nextId
      return next
    })
  })

  const renderVideoCell = useMemoizedFn((slotIndex: number) => {
    const videoId = slotVideoIds[slotIndex]
    const video = videoId ? videoIdMap.get(videoId) : undefined
    const showSwitch = selectedIds.length > 1

    return (
      <div className="size-full bg-black/70 relative overflow-hidden">
        {video ? (
          <DeviceLiveVideo
            deviceId={video.deviceId}
            productKey={video.productKey}
            videoId={video.videoId}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-fore/70">
            暂无视频
          </div>
        )}
        <div className="absolute left-2 right-2 top-2 flex items-center justify-between text-xs text-fore/80 pointer-events-none">
          <span className="truncate">{video?.label ?? '未选择视频'}</span>
          {showSwitch && (
            <div className="flex items-center gap-1 pointer-events-auto">
              <IconButton
                className="bg-black/50 text-fore/80"
                onClick={() => handleSwitch(slotIndex, -1)}
              >
                <IconLeft className="scale-90" />
              </IconButton>
              <IconButton
                className="bg-black/50 text-fore/80"
                onClick={() => handleSwitch(slotIndex, 1)}
              >
                <IconRight className="scale-90" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    )
  })

  if (gridSize === 1) {
    return (
      <div className="size-full p-3">
        <div className="size-full rounded overflow-hidden">
          {renderVideoCell(0)}
        </div>
      </div>
    )
  }

  const rowCount = gridSize
  const rowSize = 100 / rowCount

  return (
    <div className="size-full p-3">
      <ResizablePanelGroup direction="vertical" className="size-full gap-2">
        {Array.from({ length: rowCount }, (_, rowIndex) => {
          const rowStartIndex = rowIndex * gridSize
          return (
            <Fragment key={`row-${rowIndex}`}>
              <ResizablePanel
                defaultSize={rowSize}
                minSize={15}
                className="rounded overflow-hidden"
              >
                <ResizablePanelGroup
                  direction="horizontal"
                  className="size-full gap-2"
                >
                  {Array.from({ length: gridSize }, (_, colIndex) => {
                    const slotIndex = rowStartIndex + colIndex
                    return (
                      <Fragment key={`cell-${slotIndex}`}>
                        <ResizablePanel
                          defaultSize={rowSize}
                          minSize={15}
                          className="rounded overflow-hidden"
                        >
                          {renderVideoCell(slotIndex)}
                        </ResizablePanel>
                        {colIndex < gridSize - 1 && (
                          <ResizableHandle
                            withHandle
                            className="bg-ground-5/40"
                          />
                        )}
                      </Fragment>
                    )
                  })}
                </ResizablePanelGroup>
              </ResizablePanel>
              {rowIndex < rowCount - 1 && (
                <ResizableHandle withHandle className="bg-ground-5/40" />
              )}
            </Fragment>
          )
        })}
      </ResizablePanelGroup>
    </div>
  )
})

SmartCarVideoWall.displayName = 'SmartCarVideoWall'

export default SmartCarVideoWall
