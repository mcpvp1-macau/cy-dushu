import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

const useWaylineEditOpen = () => {
  const waylineEditOpen = useRebotDogWaylineStore((s) => s.open)
  const updateOpen = useRebotDogWaylineStore((s) => s.updateOpen)

  useEffect(() => {
    if (waylineEditOpen) {
      updateOpen(false)
    }
  }, [waylineEditOpen, updateOpen])
}

export default useWaylineEditOpen
