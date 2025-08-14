import { PointCloudLayer, PointCloudMap } from '@/components/PointCloudMap'
import usePointCloud3DWaylineInit from './hooks/useWaylineInit'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { handleStorageURL } from '@/pages/events/components/EventDetail'

type PropsType = unknown

const PointCloud3DWaylineEdit: FC<PropsType> = memo(() => {
  usePointCloud3DWaylineInit()

  const spaceMapUrl = usePointCloud3DWaylineStore((s) => s.spaceMapUrl).replace(
    'stroage',
    'storage',
  )

  console.log('spaceMapUrl', spaceMapUrl)

  return (
    <div className="page-full bg-ground-2 overflow-y-hidden flex">
      <div className="w-[350px] h-full bg-slate-600"></div>
      <div className="flex-1 h-full">
        <PointCloudMap>
          {spaceMapUrl && (
            <PointCloudLayer url={handleStorageURL(spaceMapUrl)} />
          )}
        </PointCloudMap>
      </div>
    </div>
  )
})

PointCloud3DWaylineEdit.displayName = 'PointCloud3DWaylineEdit'

export default PointCloud3DWaylineEdit
