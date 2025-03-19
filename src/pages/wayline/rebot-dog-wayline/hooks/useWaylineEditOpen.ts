import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

const useWaylineEditOpen = () => {
  const updateOpen = useRebotDogWaylineStore((s) => s.updateOpen)

  useEffect(() => {
    updateOpen(true)

    return () => {
      updateOpen(false)
    }
  }, [updateOpen])
}

export default useWaylineEditOpen
