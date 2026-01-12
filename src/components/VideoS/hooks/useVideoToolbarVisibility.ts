type VideoToolbarVisibilityResult = {
  isToolbarLocked: boolean
  lockToolbar: () => void
  unlockToolbar: () => void
  handleToolbarOpenChange: (open: boolean) => void
}

/** 视频工具栏显隐联动逻辑 */
const useVideoToolbarVisibility = (): VideoToolbarVisibilityResult => {
  // 下拉框打开时保持工具栏可见
  const [openCount, setOpenCount] = useState(0)
  const isToolbarLocked = openCount > 0

  /** 锁定工具栏显示 */
  const lockToolbar = useMemoizedFn(() => {
    setOpenCount((prev) => prev + 1)
  })

  /** 释放工具栏显示锁 */
  const unlockToolbar = useMemoizedFn(() => {
    // 防止计数为负，避免误触导致工具栏被永久隐藏
    setOpenCount((prev) => Math.max(prev - 1, 0))
  })

  /** 处理工具栏下拉框开关 */
  const handleToolbarOpenChange = useMemoizedFn((open: boolean) => {
    if (open) {
      lockToolbar()
      return
    }
    unlockToolbar()
  })

  return {
    isToolbarLocked,
    lockToolbar,
    unlockToolbar,
    handleToolbarOpenChange,
  }
}

export default useVideoToolbarVisibility
