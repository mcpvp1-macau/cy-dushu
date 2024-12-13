import useGlobalMapStore from '@/store/map/useGlobalMap.store'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'

type PropsType = unknown

/** 更新地图实例 */
const UpdateMap: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const updateViewer = useGlobalMapStore((s) => s.updateViewer)

  useEffect(() => {
    if (!viewer) {
      return
    }
    updateViewer(viewer)
    return () => {
      updateViewer(null)
    }
  }, [])

  return null
})

UpdateMap.displayName = 'UpdateMap'

export default UpdateMap
