import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconShare from '@/assets/icons/jsx/IconShare'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { deleteOverlaies } from '@/service/modules/layer_overlay'
import { CotType } from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { usePersonTreeOptions } from '@/store/usePerson.store'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

const MapOverlayConfig: FC<PropsType> = memo(({ data }) => {
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()

  const handleDelte = async () => {
    setLoading(true)
    try {
      await deleteOverlaies([data.overlayId])
      msgApi.success('删除成功')
      queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const hiddenOverlayIds = useMapLayerAndOverlayStore((s) => s.hiddenOverlayIds)
  const updateHiddenOverlayIds = useMapLayerAndOverlayStore(
    (s) => s.updateHiddenOverlayIds,
  )

  const [open, setOpen] = useState(false)
  const treeData = usePersonTreeOptions()

  return (
    <li key={data.overlayId} className="flex justify-between">
      <div className="flex gap-2">
        {data.cotType === CotType.POINT ? (
          <IconAddMark className="text-primary" />
        ) : (
          <IconDrawArea className="text-primary" />
        )}
        <p className="max-w-[210px] truncate">{data.overlayName}</p>
      </div>
      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <LoadingOutlined />
        ) : (
          <>
            <IconButton
              onClick={() => {
                if (hiddenOverlayIds.has(data.overlayId)) {
                  hiddenOverlayIds.delete(data.overlayId)
                } else {
                  hiddenOverlayIds.add(data.overlayId)
                }
                updateHiddenOverlayIds(new Set(hiddenOverlayIds))
              }}
            >
              {hiddenOverlayIds.has(data.overlayId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            <IconButton className="scale-90" onClick={() => setOpen(true)}>
              <IconShare />
            </IconButton>
            <IconButton className="scale-90" onClick={handleDelte}>
              <IconDelete />
            </IconButton>
          </>
        )}
        <FormModal
          open={open}
          title="分享覆盖物"
          items={[
            {
              label: '选择用户',
              name: 'userId',
              type: 'tree-select',
              treeData: treeData,
              otherProps: {
                treeCheckable: true,
                maxTagCount: 2,
              },
            },
          ]}
          onClose={() => setOpen(false)}
        />
      </div>
    </li>
  )
})

MapOverlayConfig.displayName = 'MapOverlayConfig'

export default MapOverlayConfig
