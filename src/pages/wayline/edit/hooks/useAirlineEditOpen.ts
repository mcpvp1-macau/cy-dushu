import useRightMode from '@/store/layout/useRightMode.store'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

/** 航线编辑开关状态 */
const useAirlineEditOpen = () => {
  const setOpen = useAirlineConfigStore((s) => s.updateOpen)
  const resetState = useAirlineConfigStore((s) => s.resetState)
  const updateRightMode = useRightMode((s) => s.updateRightMode)

  useEffect(() => {
    setOpen(true)
    updateRightMode(null)
    return () => {
      resetState()
    }
  }, [])
}

export default useAirlineEditOpen
