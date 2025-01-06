import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import { ComponentRef, memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { shouldJson } from '@/utils/json'
import { argbToHex, hexToARGB } from '@/utils/color'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { ColorPicker, Form, Input } from 'antd'
import { deleteOverlaies, updateOverlay } from '@/service/modules/layer_overlay'
import { LoadingOutlined } from '@ant-design/icons'
import { CotType } from '@/store/map/useDraw.store'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import { useForm } from 'antd/es/form/Form'
import { AggregationColor } from 'antd/es/color-picker/color'
import { getHexWithAlpha } from '@/utils/other/utils'
import IconTick from '@/assets/icons/jsx/IconTick'

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

  const queryClient = useQueryClient()

  const styleConfig = useMemo(
    () => shouldJson(overlay?.overlayStyleConfig),
    [overlay],
  )

  const [isConfirmLoading, setConfirmLoading] = useState(false)
  const handleSave = async () => {
    const value = form.getFieldsValue()
    const hexStr = value.color.toHexString()
    let overlayStyleConfig: Record<string, any> = {}
    if (overlay?.cotType === CotType.POINT) {
      const colorRGBA = hexToARGB(hexStr)
      overlayStyleConfig = {
        ...styleConfig,
        color: {
          '-argb': colorRGBA,
          hex: hexStr,
        },
        remarks: value.remarks,
      }
    } else {
      const strokeColorHex = getHexWithAlpha(hexStr, 1)
      const strokeColorARGB = hexToARGB(strokeColorHex)
      const fillColorHex = getHexWithAlpha(hexStr, 0.5)
      const fillColorARGB = hexToARGB(fillColorHex)
      overlayStyleConfig = {
        ...styleConfig,
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        remarks: value.remarks,
      }
    }

    try {
      setConfirmLoading(true)
      await updateOverlay({
        ...overlay!,
        overlayBindActions: overlay!.overlayBindType,
        overlayName: (value.overlayName || overlay?.overlayName) ?? '',
        overlayStyleConfig: JSON.stringify(overlayStyleConfig),
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
    if (!styleConfig) {
      return '#fff'
    }
    const color =
      styleConfig?.color?.['-argb'] || styleConfig?.fillColor?.['-value']
    return argbToHex(String(color))[0]
  }, [overlay])

  const inputRef = useRef<ComponentRef<typeof Input>>(null)
  const [form] = useForm<{
    overlayName?: string
    color: AggregationColor
    remarks?: string
  }>()

  useEffect(() => {
    form.setFieldsValue({
      overlayName: overlay?.overlayName,
      color: new AggregationColor(renderColor),
      remarks: styleConfig?.remarks,
    })
  }, [styleConfig, renderColor])

  return (
    <div className="w-[350px] backdrop-blur">
      <Form form={form}>
        <CloseableHeader>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              {overlay?.cotType === CotType.POINT ? (
                <IconAddMark className="device-detail-icon" />
              ) : (
                <IconDrawArea className="device-detail-icon" />
              )}
              <Form.Item noStyle name="overlayName">
                {isEdit ? (
                  <Input
                    ref={inputRef}
                    size="small"
                    // value={renameValue}
                    // onChange={(e) => setRenameValue(e.currentTarget.value)}
                  />
                ) : (
                  <h6 className="text-white text-base max-w-[190px] truncate">
                    {overlay?.overlayName || '-'}
                  </h6>
                )}
              </Form.Item>
            </div>
            <div className="flex gap-2">
              {isConfirmLoading ? (
                <LoadingOutlined />
              ) : (
                <>
                  {isEdit ? (
                    <>
                      <IconButton
                        toolTipProps={{ title: '保存' }}
                        onClick={handleSave}
                      >
                        <IconTick className="scale-90" />
                      </IconButton>
                    </>
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
              <Form.Item noStyle name="color">
                {isEdit ? (
                  <ColorPicker size="small" disabledAlpha />
                ) : (
                  <div className="text-white">
                    <div
                      className="w-3.5 h-3.5 rounded border border-solid border-white"
                      style={{
                        backgroundColor: renderColor,
                      }}
                    />
                  </div>
                )}
              </Form.Item>
            </div>

            <p className="flex gap-2">
              <span className="whitespace-nowrap">备注信息:</span>
              <Form.Item noStyle name="remarks">
                {isEdit ? (
                  <Input size="small" className="h-5" />
                ) : (
                  <span className="text-white">
                    {styleConfig.remarks || '-'}
                  </span>
                )}
              </Form.Item>
            </p>
          </div>
        ) : (
          <AppEmpty />
        )}
      </Form>
    </div>
  )
})

RightOverlayDetail.displayName = 'RightPointDetail'

export default RightOverlayDetail
