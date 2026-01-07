import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import IconButton from '@/components/ui/button/IconButton'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import { useSize } from 'ahooks'

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
  onSelectedChange: (nextIds: string[]) => void
}

const MIN_PANEL_SIZE = 120

const SmartCarVideoWall: FC<PropsType> = memo(
  ({ videoItems, selectedIds, onSelectedChange }) => {
    const videoIdMap = useMemo(() => {
      const map = new Map<string, SmartCarVideoItem>()
      videoItems.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    }, [videoItems])

    const allIds = useMemo(
      () => videoItems.map((item) => item.id),
      [videoItems],
    )

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
    const [rowSizes, setRowSizes] = useState<number[]>([])
    const [colSizes, setColSizes] = useState<number[]>([])
    const [draggingSlotIndex, setDraggingSlotIndex] = useState<number | null>(
      null,
    )
    const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(
      null,
    )
    const [dragState, setDragState] = useState<{
      axis: 'row' | 'col'
      index: number
      startPos: number
      startSizes: number[]
    } | null>(null)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const size = useSize(containerRef)

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

    useEffect(() => {
      if (gridSize <= 0) {
        setRowSizes([])
        setColSizes([])
        return
      }

      const sizeValue = 100 / gridSize
      setRowSizes(Array.from({ length: gridSize }, () => sizeValue))
      setColSizes(Array.from({ length: gridSize }, () => sizeValue))
      // 业务规则：布局行列变化时重置为均分，避免历史拖拽比例失真。
    }, [gridSize])

    const getNextUnselectedId = useMemoizedFn(
      (currentId: string | undefined, step: number) => {
        if (!allIds.length || selectedSet.size === allIds.length) {
          return ''
        }

        let currentIndex = currentId ? allIds.indexOf(currentId) : -1
        if (currentIndex === -1) {
          currentIndex = step > 0 ? -1 : 0
        }

        for (let i = 0; i < allIds.length; i += 1) {
          const nextIndex =
            (currentIndex + step + allIds.length) % allIds.length
          const nextId = allIds[nextIndex]
          currentIndex = nextIndex
          if (!selectedSet.has(nextId)) {
            return nextId
          }
        }

        return ''
      },
    )

    const handleSwitch = useMemoizedFn((slotIndex: number, step: number) => {
      const currentId = slotVideoIds[slotIndex]
      const nextId = getNextUnselectedId(currentId, step)

      if (!nextId || currentId === nextId) {
        return
      }

      const nextSelected = [...selectedIds]
      const currentIndex = currentId ? nextSelected.indexOf(currentId) : -1
      if (currentIndex >= 0) {
        nextSelected[currentIndex] = nextId
      } else {
        nextSelected.push(nextId)
      }

      const uniqueSelected = nextSelected.filter(
        (id, index) => nextSelected.indexOf(id) === index,
      )

      onSelectedChange(uniqueSelected)

      setSlotVideoIds((prev) => {
        const next = [...prev]
        next[slotIndex] = nextId
        return next
      })
      // 业务规则：左右切换时，仅从未选中的视频里替换当前分块。
    })

    const handleSwapSlots = useMemoizedFn(
      (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) {
          return
        }

        const fromId = slotVideoIds[fromIndex]
        const toId = slotVideoIds[toIndex]

        if (!fromId || !toId || fromId === toId) {
          return
        }

        const nextSelected = [...selectedIds]
        const fromSelectedIndex = nextSelected.indexOf(fromId)
        const toSelectedIndex = nextSelected.indexOf(toId)

        if (fromSelectedIndex === -1 || toSelectedIndex === -1) {
          // 边界情况：分块状态与选中列表不同步时，不触发交换。
          return
        }

        nextSelected[fromSelectedIndex] = toId
        nextSelected[toSelectedIndex] = fromId

        onSelectedChange(nextSelected)

        setSlotVideoIds((prev) => {
          const next = [...prev]
          next[fromIndex] = toId
          next[toIndex] = fromId
          return next
        })
        // 业务规则：拖拽交换需要同步更新选中顺序，确保布局保持一致。
      },
    )

    const handleDragStart = useMemoizedFn(
      (slotIndex: number, event: React.DragEvent<HTMLDivElement>) => {
        const currentId = slotVideoIds[slotIndex]
        if (!currentId) {
          event.preventDefault()
          return
        }

        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(slotIndex))
        setDraggingSlotIndex(slotIndex)
      },
    )

    const handleDragOver = useMemoizedFn(
      (slotIndex: number, event: React.DragEvent<HTMLDivElement>) => {
        if (draggingSlotIndex === null || draggingSlotIndex === slotIndex) {
          return
        }

        if (!slotVideoIds[slotIndex]) {
          return
        }

        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setDragOverSlotIndex(slotIndex)
      },
    )

    const handleDragLeave = useMemoizedFn((slotIndex: number) => {
      if (dragOverSlotIndex === slotIndex) {
        setDragOverSlotIndex(null)
      }
    })

    const handleDrop = useMemoizedFn(
      (slotIndex: number, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const sourceIndex =
          draggingSlotIndex ??
          Number.parseInt(event.dataTransfer.getData('text/plain'), 10)

        if (Number.isNaN(sourceIndex)) {
          return
        }

        handleSwapSlots(sourceIndex, slotIndex)
        setDraggingSlotIndex(null)
        setDragOverSlotIndex(null)
      },
    )

    const handleDragEnd = useMemoizedFn(() => {
      setDraggingSlotIndex(null)
      setDragOverSlotIndex(null)
    })

    const renderVideoCell = useMemoizedFn((slotIndex: number) => {
      const videoId = slotVideoIds[slotIndex]
      const video = videoId ? videoIdMap.get(videoId) : undefined
      const showSwitch = videoItems.length > selectedIds.length

      return (
        <div className="size-full bg-black/70 relative overflow-hidden">
          {video ? (
            <DeviceLiveVideo
              deviceId={video.deviceId}
              productKey={video.productKey}
              videoId={video.videoId}
              useDing={false}
              useTopBar={false}
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

    const handleResizeStart = useMemoizedFn(
      (
        axis: 'row' | 'col',
        index: number,
        clientX: number,
        clientY: number,
      ) => {
        setDragState({
          axis,
          index,
          startPos: axis === 'col' ? clientX : clientY,
          startSizes: axis === 'col' ? colSizes : rowSizes,
        })
      },
    )

    useEffect(() => {
      if (!dragState) {
        return
      }

      const handleMove = (clientX: number, clientY: number) => {
        const totalSize =
          dragState.axis === 'col' ? size?.width ?? 0 : size?.height ?? 0
        if (!totalSize) {
          return
        }

        const delta =
          (dragState.axis === 'col' ? clientX : clientY) - dragState.startPos
        const deltaPercent = (delta / totalSize) * 100
        const minPercent = (MIN_PANEL_SIZE / totalSize) * 100

        const nextSizes = [...dragState.startSizes]
        nextSizes[dragState.index - 1] += deltaPercent
        nextSizes[dragState.index] -= deltaPercent

        if (nextSizes[dragState.index - 1] < minPercent) {
          nextSizes[dragState.index] -=
            minPercent - nextSizes[dragState.index - 1]
          nextSizes[dragState.index - 1] = minPercent
        } else if (nextSizes[dragState.index] < minPercent) {
          nextSizes[dragState.index - 1] -=
            minPercent - nextSizes[dragState.index]
          nextSizes[dragState.index] = minPercent
        }

        if (dragState.axis === 'col') {
          setColSizes(nextSizes)
        } else {
          setRowSizes(nextSizes)
        }
      }

      const handleMouseMove = (event: MouseEvent) => {
        handleMove(event.clientX, event.clientY)
      }

      const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length !== 1) {
          return
        }
        handleMove(event.touches[0].clientX, event.touches[0].clientY)
      }

      const handleMouseUp = () => {
        setDragState(null)
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }

      window.document.body.style.cursor =
        dragState.axis === 'col' ? 'col-resize' : 'row-resize'
      window.document.body.style.userSelect = 'none'

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }, [dragState, size?.height, size?.width])

    const colOffsets = useMemo(() => {
      let sum = 0
      return colSizes.slice(0, -1).map((size) => {
        sum += size
        return sum
      })
    }, [colSizes])

    const rowOffsets = useMemo(() => {
      let sum = 0
      return rowSizes.slice(0, -1).map((size) => {
        sum += size
        return sum
      })
    }, [rowSizes])

    if (gridSize === 1) {
      return <div className="size-full">{renderVideoCell(0)}</div>
    }

    return (
      <div className="size-full">
        <div
          ref={containerRef}
          className="size-full relative rounded overflow-hidden bg-ground-2"
        >
          <div
            className="grid size-full"
            style={{
              gridTemplateColumns: colSizes.map((size) => `${size}%`).join(' '),
              gridTemplateRows: rowSizes.map((size) => `${size}%`).join(' '),
            }}
          >
            {Array.from({ length: slotCount }, (_, index) => (
              <div
                key={`cell-${index}`}
                className={clsx(
                  'relative overflow-hidden border border-ground-5/40',
                  dragOverSlotIndex === index && 'ring-2 ring-primary/70',
                )}
                draggable={Boolean(slotVideoIds[index])}
                onDragStart={(event) => handleDragStart(index, event)}
                onDragOver={(event) => handleDragOver(index, event)}
                onDragLeave={() => handleDragLeave(index)}
                onDrop={(event) => handleDrop(index, event)}
                onDragEnd={handleDragEnd}
              >
                {renderVideoCell(index)}
              </div>
            ))}
          </div>

          {colOffsets.map((offset, index) => (
            <div
              key={`col-handle-${index}`}
              className="absolute top-0 bottom-0 w-2 cursor-col-resize group"
              style={{ left: `calc(${offset}% - 4px)` }}
              onMouseDown={(event) =>
                handleResizeStart(
                  'col',
                  index + 1,
                  event.clientX,
                  event.clientY,
                )
              }
              onTouchStart={(event) => {
                if (event.touches.length !== 1) {
                  return
                }
                const touch = event.touches[0]
                handleResizeStart(
                  'col',
                  index + 1,
                  touch.clientX,
                  touch.clientY,
                )
              }}
            >
              <div className="abs-center h-6 w-0.5 bg-ground-5 group-hover:bg-primary rounded" />
              <div
                className={clsx(
                  'abs-center h-full w-0.5 rounded',
                  dragState?.axis === 'col' && dragState.index === index + 1
                    ? 'bg-primary'
                    : 'bg-ground-5',
                )}
              />
            </div>
          ))}

          {rowOffsets.map((offset, index) => (
            <div
              key={`row-handle-${index}`}
              className="absolute left-0 right-0 h-2 cursor-row-resize group"
              style={{ top: `calc(${offset}% - 4px)` }}
              onMouseDown={(event) =>
                handleResizeStart(
                  'row',
                  index + 1,
                  event.clientX,
                  event.clientY,
                )
              }
              onTouchStart={(event) => {
                if (event.touches.length !== 1) {
                  return
                }
                const touch = event.touches[0]
                handleResizeStart(
                  'row',
                  index + 1,
                  touch.clientX,
                  touch.clientY,
                )
              }}
            >
              <div className="abs-center w-6 h-0.5 bg-ground-5 group-hover:bg-primary rounded" />
              <div
                className={clsx(
                  'abs-center w-full h-0.5 rounded',
                  dragState?.axis === 'row' && dragState.index === index + 1
                    ? 'bg-primary'
                    : 'bg-ground-5',
                )}
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
)

SmartCarVideoWall.displayName = 'SmartCarVideoWall'

export default SmartCarVideoWall
