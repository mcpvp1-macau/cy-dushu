import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'

type PropsType = {
  searchKw?: string
}

const Reconstruction2DList: FC<PropsType> = memo(({ searchKw }) => {
  const list = useReconstruction2DMapStore((s) => s.reconstruction2DList)

  const renderList = useMemo(
    () =>
      list.filter(
        (item) =>
          item.name.toLowerCase().includes((searchKw ?? '').toLowerCase()),
        [list, searchKw],
      ),
    [list, searchKw],
  )

  const hiddenSet = useReconstruction2DMapStore(
    (s) => s.hiddenReconstruction2DSet,
  )

  if (renderList.length === 0) {
    return <AppEmpty />
  }

  return (
    <ul className="flex flex-col gap-2 m-3">
      {renderList.map((e) => (
        <li key={e.id} className="flex justify-between">
          <span>{e.name}</span>
          <IconButton
            onClick={() => {
              const newSet = new Set(hiddenSet)
              if (newSet.has(e.id)) {
                newSet.delete(e.id)
              } else {
                newSet.add(e.id)
              }
              useReconstruction2DMapStore
                .getState()
                .updateHiddenReconstruction2DSet(newSet)
            }}
          >
            {hiddenSet.has(e.id) ? <IconNotVisible /> : <IconVisible />}
          </IconButton>
        </li>
      ))}
    </ul>
  )
})

Reconstruction2DList.displayName = 'Reconstruction2DList'

export default Reconstruction2DList
