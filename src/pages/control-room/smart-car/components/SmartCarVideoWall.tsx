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
  layoutResetKey?: number
}

const MIN_PANEL_SIZE = 120

const SmartCarVideoWall: FC<PropsType> = memo(
  ({ videoItems, selectedIds, onSelectedChange, layoutResetKey }) => {
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
    const [dragBoxStyle, setDragBoxStyle] = useState<{
      left: number
      top: number
      width: number
      height: number
    } | null>(null)
    const [dragState, setDragState] = useState<{
      axis: 'row' | 'col'
      index: number
      startPos: number
      startSizes: number[]
    } | null>(null)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const slotRefs = useRef<Array<HTMLDivElement | null>>([])
    const size = useSize(containerRef)

    useEffect(() => {
      if (slotCount === 0) {
        setSlotVideoIds([])
        return
      }
      setSlotVideoIds((prev) => {
        const usedIds = new Set<string>()
        const next = Array.from({ length: slotCount }, (_, index) => {
          const prevId = prev[index]
          if (prevId && selectedSet.has(prevId) && !usedIds.has(prevId)) {
            usedIds.add(prevId)
            return prevId
          }
          return ''
        })

        let fillIndex = 0
        for (let i = 0; i < next.length; i += 1) {
          if (next[i]) {
            continue
          }

          while (fillIndex < selectedIds.length) {
            const candidate = selectedIds[fillIndex]
            fillIndex += 1
            if (!candidate || usedIds.has(candidate)) {
              continue
            }
            next[i] = candidate
            usedIds.add(candidate)
            break
          }
        }
        return next
      })
      // 业务规则：选中项变化时，保留已选中的分块并去重，其余按当前选中顺序补齐。
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
      // 业务规则：布局变化或点击复位时均分分块比例，避免历史拖拽比例失真。
    }, [gridSize, layoutResetKey])

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

    const handleMoveToEmptySlot = useMemoizedFn(
      (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) {
          return
        }

        const fromId = slotVideoIds[fromIndex]
        const toId = slotVideoIds[toIndex]

        if (!fromId || toId) {
          return
        }

        const nextSlotVideoIds = [...slotVideoIds]
        nextSlotVideoIds[toIndex] = fromId
        nextSlotVideoIds[fromIndex] = ''

        const nextSelected = nextSlotVideoIds.filter(Boolean) as string[]

        onSelectedChange(nextSelected)
        setSlotVideoIds(nextSlotVideoIds)
        // 业务规则：允许移动到空槽位，空槽位保留在原位置。
      },
    )

    const updateDragBoxStyle = useMemoizedFn((slotIndex: number) => {
      const container = containerRef.current
      const slot = slotRefs.current[slotIndex]
      if (!container || !slot) {
        return
      }

      const containerRect = container.getBoundingClientRect()
      const slotRect = slot.getBoundingClientRect()

      setDragBoxStyle({
        left: slotRect.left - containerRect.left,
        top: slotRect.top - containerRect.top,
        width: slotRect.width,
        height: slotRect.height,
      })
      // 业务规则：拖拽时以容器内坐标定位，确保缩放或滚动下的定位准确。
    })

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
        updateDragBoxStyle(slotIndex)
      },
    )

    const handleDragOver = useMemoizedFn(
      (slotIndex: number, event: React.DragEvent<HTMLDivElement>) => {
        if (draggingSlotIndex === null) {
          return
        }

        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'

        if (draggingSlotIndex === slotIndex) {
          setDragOverSlotIndex(null)
          updateDragBoxStyle(slotIndex)
          // 业务规则：拖回起始分块时，定位框需要回到原位。
          return
        }

        setDragOverSlotIndex(slotIndex)
        updateDragBoxStyle(slotIndex)
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

        if (!slotVideoIds[slotIndex]) {
          handleMoveToEmptySlot(sourceIndex, slotIndex)
        } else {
          handleSwapSlots(sourceIndex, slotIndex)
        }
        setDraggingSlotIndex(null)
        setDragOverSlotIndex(null)
        setDragBoxStyle(null)
      },
    )

    const handleDragEnd = useMemoizedFn(() => {
      setDraggingSlotIndex(null)
      setDragOverSlotIndex(null)
      setDragBoxStyle(null)
    })

    const renderVideoCell = useMemoizedFn((slotIndex: number) => {
      const videoId = slotVideoIds[slotIndex]
      const video = videoId ? videoIdMap.get(videoId) : undefined
      const showSwitch = videoItems.length > selectedIds.length

      return (
        <div className="size-full bg-black/70 relative overflow-hidden">
          {video ? (
            <DeviceLiveVideo
              key={video.id}
              deviceId={video.deviceId}
              productKey={video.productKey}
              videoId={video.videoId}
              useDing={false}
              useTopBar={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-fore/70 select-none">
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
                key={`cell-${index}-${slotVideoIds[index] || 'empty'}`}
                ref={(element) => {
                  slotRefs.current[index] = element
                }}
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

          {dragBoxStyle && (
            <div
              className="absolute rounded border-2 border-blue-500 bg-blue-500/20 pointer-events-none transition-all duration-200 ease-out"
              style={{
                left: dragBoxStyle.left,
                top: dragBoxStyle.top,
                width: dragBoxStyle.width,
                height: dragBoxStyle.height,
              }}
            />
          )}

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
