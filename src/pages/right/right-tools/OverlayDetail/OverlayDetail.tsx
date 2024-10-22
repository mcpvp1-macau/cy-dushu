import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import { ComponentRef, memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { shouldJson } from '@/utils/json'
import { argbToHex } from '@/utils/color'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Input } from 'antd'
import IconSave from '@/assets/icons/jsx/IconSave'
import { deleteOverlaies, updateOverlay } from '@/service/modules/layer_overlay'
import { LoadingOutlined } from '@ant-design/icons'
import { CotType } from '@/store/map/useDraw.store'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'

type PropsType = unknown

const RightOverlayDetail: FC<PropsType> = memo(() => {
  const detailId = useRightMode((s) => s.detailId)

  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)

  const overlay = useMemo(() => {
    if (!detailId) return null
    const d = +detailId
    return overlayList.find((e) => e.overlayId === d)
  }, [detailId, overlayList])

  const [isEdit, { toggle, setFalse }] = useBoolean(false)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    setRenameValue(overlay?.overlayName ?? '')
  }, [overlay])

  const [isConfirmLoading, setConfirmLoading] = useState(false)
  const queryClient = useQueryClient()
  const handleSave = async () => {
    try {
      setConfirmLoading(true)
      await updateOverlay({
        ...overlay!,
        overlayBindActions: overlay!.overlayBindType,
        overlayName: renameValue,
      })
      setFalse()
      queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const handleDelete = async () => {
    try {
      setConfirmLoading(true)
      await deleteOverlaies([overlay!.overlayId])
      updateRightMode(null)
      await queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const renderColor = useMemo(() => {
    if (!overlay?.overlayStyleConfig) {
      return '#fff'
    }
    const styleConfig = shouldJson(overlay.overlayStyleConfig)
    const color =
      styleConfig?.color?.['-argb'] || styleConfig?.fillColor?.['-value']
    return argbToHex(String(color))[0]
  }, [overlay])

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            {overlay?.cotType === CotType.POINT ? (
              <IconAddMark className="device-detail-icon" />
            ) : (
              <IconDrawArea className="device-detail-icon" />
            )}
            {isEdit ? (
              <Input
                ref={inputRef}
                size="small"
                value={renameValue}
                onChange={(e) => setRenameValue(e.currentTarget.value)}
              />
            ) : (
              <h6 className="text-white text-base max-w-[190px] truncate">
                {overlay?.overlayName || '-'}
              </h6>
            )}
          </div>
          <div className="flex gap-2">
            {isConfirmLoading ? (
              <LoadingOutlined />
            ) : (
              <>
                {isEdit ? (
                  <IconButton
                    toolTipProps={{ title: '保存' }}
                    onClick={handleSave}
                  >
                    <IconSave className="scale-90" />
                  </IconButton>
                ) : (
                  <IconButton
                    toolTipProps={{ title: '编辑' }}
                    onClick={() => {
                      toggle()
                      setTimeout(() => {
                        inputRef.current?.focus()
                      }, 333)
                    }}
                  >
                    <IconEdit className="scale-90" />
                  </IconButton>
                )}
                {/* <IconButton toolTipProps={{ title: '分享' }}>
                  <IconShare className="scale-90" />
                </IconButton> */}
                <IconButton
                  toolTipProps={{ title: '删除点位' }}
                  onClick={handleDelete}
                >
                  <IconDelete className="scale-90" />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </CloseableHeader>

      {overlayList.length === 0 ? (
        <AppSpin />
      ) : overlay ? (
        <div className="mx-3 mb-3 flex flex-col gap-2 text-sm">
          <p className="flex gap-2">
            创建时间:<span className="text-white">{overlay.gmtCreate}</span>
          </p>
          <p className="flex gap-2">
            创建人员:<span className="text-white">{overlay.name}</span>
          </p>
          <p className="flex gap-2">
            创建位置:
            <span className="text-white">
              {shouldJson(overlay.overlayPositions)?.[0]
                ?.slice(0, 2)
                ?.join(', ')}
            </span>
          </p>
          <div className="flex gap-2 items-center">
            点位颜色:
            <div className="text-white">
              <div
                className="w-3.5 h-3.5 rounded border border-solid border-white"
                style={{
                  backgroundColor: renderColor,
                }}
              />
            </div>
          </div>
          <p className="flex gap-2">
            备注信息:
            <span className="text-white">-</span>
          </p>
        </div>
      ) : (
        <AppEmpty />
      )}
    </div>
  )
})

RightOverlayDetail.displayName = 'RightPointDetail'

export default RightOverlayDetail
