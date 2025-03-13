import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import { RightModeEnum } from '@/enum/right-mode'
import { useAppMsg } from '@/hooks/useAppMsg'
import { deleteLayer } from '@/service/modules/reconstruction'
import useRightMode from '@/store/layout/useRightMode.store'
import { useReconstructionMapConfigStore } from '@/store/map/useReconstructionMap.store'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  data: API_RECONSTRUCTION.Layer
}

const ReconstructionMapConfig: FC<PropsType> = memo((props) => {
  const data = props.data
  const msgApi = useAppMsg()
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const rightMode = useRightMode((s) => s.rightMode)
  const rightDetailId = useRightMode((s) => s.detailId)

  const hiddenGroupIds = useReconstructionMapConfigStore(
    (s) => s.hiddenGroupIds,
  )
  const updateHiddenGroupIds = useReconstructionMapConfigStore(
    (s) => s.updateHiddenGroupIds,
  )
  const handleDelte = async (overlayId: number) => {
    setLoading(true)

    // try {
    //   await deleteLayer(overlayId)
    //   msgApi.success('删除成功')

    //   // if (
    //   //   rightMode === RightModeEnum.RECONSTRUCTION_DETAIL &&
    //   //   rightDetailId == String(data.overlayId)
    //   // ) {
    //   //   useRightMode.setState({ rightMode: null })
    //   // }

    //   await queryClient.invalidateQueries({
    //     queryKey: ['reconstruction-layerList'],
    //     exact: false,
    //   })
    // } finally {
    //   setLoading(false)
    // }

    setTimeout(() => {
      setLoading(false)
      msgApi.success('删除成功')
    }, 1000)
  }

  return (
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
                if (hiddenGroupIds.has(data.overlayId)) {
                  hiddenGroupIds.delete(data.overlayId)
                } else {
                  hiddenGroupIds.add(data.overlayId)
                }
                updateHiddenGroupIds(new Set(hiddenGroupIds))
              }}
            >
              {hiddenGroupIds.has(data.overlayId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
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
  )
})

ReconstructionMapConfig.displayName = 'ReconstructionMapConfig'

export default ReconstructionMapConfig
