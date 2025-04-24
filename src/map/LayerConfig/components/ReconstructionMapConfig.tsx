import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import { RightModeEnum } from '@/enum/right-mode'
import { useAppMsg } from '@/hooks/useAppMsg'
import { deleteLayer, getLayerList } from '@/service/modules/reconstruction'
import useRightMode from '@/store/layout/useRightMode.store'
import useReconstructionMap, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import { LoadingOutlined } from '@ant-design/icons'
import EditReconstructionLayer from './EditReconstructionLayer'

type PropsType = {
  data: API_RECONSTRUCTION.Layer
}

const ReconstructionMapConfig: FC<PropsType> = memo((props) => {
  const data = props.data

  const msgApi = useAppMsg()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const rightMode = useRightMode((s) => s.rightMode)
  const rightDetailId = useRightMode((s) => s.detailId)

  const showLayerIds = useReconstructionMapConfigStore((s) => s.showLayerIds)
  const updateShowLayerIds = useReconstructionMapConfigStore(
    (s) => s.updateShowLayerIds,
  )
  const [layerGroupList, updateLayerList] = useReconstructionMap((s) => [
    s.layerGroupList,
    s.updateLayerList,
  ])
  const handleDelte = async (overlayId: number) => {
    setLoading(true)
    try {
      await deleteLayer(overlayId)
      const data = await getLayerList({
        layerIds: layerGroupList.map((item) => item.id),
      })
      updateLayerList(data.data)
      msgApi.success(t('api.success.msg'))

      if (
        rightMode === RightModeEnum.RECONSTRUCTION_DETAIL &&
        rightDetailId == String(overlayId)
      ) {
        useRightMode.setState({ rightMode: null })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <li key={data.overlayId} className="flex justify-between">
        <div className="flex gap-2">
          <IconRebuild3d className="text-primary" />
          <p className="max-w-[210px] truncate">{data.overlayName}</p>
        </div>
        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <LoadingOutlined />
          ) : (
            <>
              <IconButton
                onClick={() => {
                  if (showLayerIds.has(data.overlayId)) {
                    showLayerIds.delete(data.overlayId)
                  } else {
                    showLayerIds.add(data.overlayId)
                  }
                  updateShowLayerIds(new Set(showLayerIds))
                }}
              >
                {showLayerIds.has(data.overlayId) ? (
                  <IconVisible />
                ) : (
                  <IconNotVisible />
                )}
              </IconButton>
              <EditReconstructionLayer id={data.overlayId} />
              <IconButton
                className="scale-90"
                onClick={() => handleDelte(data.overlayId)}
              >
                <IconDelete />
              </IconButton>
            </>
          )}
        </div>
      </li>
    </>
  )
})

ReconstructionMapConfig.displayName = 'ReconstructionMapConfig'

export default ReconstructionMapConfig
