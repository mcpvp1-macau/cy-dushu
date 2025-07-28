import AppEmpty from '@/components/AppEmpty'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import Recon2DListItem from './Reconstruction2DListItem'
import { createReconstructionStatus } from '../Reconstruction3D/ReconstructionMapConfig'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  const { t } = useTranslation()
  const statusMap = useMemo(() => createReconstructionStatus(), [t])

  if (renderList.length === 0) {
    return <AppEmpty />
  }

  return (
    <ScrollArea className="my-3">
      <ul className="flex flex-col mx-3 gap-2 max-h-[70vh]">
        {renderList.map((e) => (
          <Recon2DListItem
            key={e.id}
            data={e}
            hiddenSet={hiddenSet}
            statusMap={statusMap}
          />
        ))}
      </ul>
    </ScrollArea>
  )
})

Reconstruction2DList.displayName = 'Reconstruction2DList'

export default Reconstruction2DList
