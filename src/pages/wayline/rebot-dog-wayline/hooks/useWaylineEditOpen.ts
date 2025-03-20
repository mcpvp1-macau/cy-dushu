import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

const useWaylineEditOpen = () => {
  const updateOpen = useRebotDogWaylineStore((s) => s.updateOpen)
  const reset = useRebotDogWaylineStore((s) => s.resetState)

  useEffect(() => {
    updateOpen(true)

    return () => {
      reset()
    }
  }, [updateOpen])
}

export default useWaylineEditOpen
