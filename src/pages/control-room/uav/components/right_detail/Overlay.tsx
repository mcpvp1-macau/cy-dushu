import useRightMode from '@/store/layout/useRightMode.store'
import AppEmpty from '@/components/AppEmpty'
import { shouldJson } from '@/utils/json'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Button, ColorPicker, Form, Input } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import IconTick from '@/assets/icons/jsx/IconTick'
import useOverlayDetail from '@/pages/right/right-tools/OverlayDetail/useOverlayDetail'
import { ComponentRef } from 'react'
import { useUavControlRoomLayoutStore } from '../../hooks/useUavControlRoomLayout.store'

type PropsType = unknown

const RightOverlayDetail: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const overlayDetailId = useUavControlRoomLayoutStore((s) => s.overlayDetailId)

  const {
    isEdit,
    toggle,
    handleSave,
    handleDelete,
    isConfirmLoading,
    form,
    overlay,
    renderColor,
    styleConfig,
  } = useOverlayDetail(overlayDetailId, () => {
    updateRightMode(null)
  })

  const updateRightMode = useRightMode((s) => s.updateRightMode)

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

  return (
    <div onKeyDown={(e) => e.stopPropagation()}>
      <Form form={form}>
        {overlay ? (
          <div className="m-3 flex flex-col gap-2 text-sm">
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
            <p className="flex gap-2">
              {t('common.createTime')}:
              <span className="text-white">{overlay.gmtCreate}</span>
            </p>
            <p className="flex gap-2">
              {t('overlay.detail.createUser.title')}:
              <span className="text-white">{overlay.name}</span>
            </p>
            <p className="flex gap-2">
              {t('overlay.detail.position.title')}:
              <span className="text-white">
                {shouldJson(overlay.overlayPositions)?.[0]
                  ?.slice(0, 2)
                  ?.join(', ')}
              </span>
            </p>

            <div className="flex gap-2 items-center">
              {t('overlay.detail.color.title')}:
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
              <span className="whitespace-nowrap">
                {t('overlay.detail.mark.title')}:
              </span>
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
            <div className="flex gap-2">
              {isConfirmLoading ? (
                <LoadingOutlined />
              ) : (
                <>
                  {isEdit ? (
                    <Button
                      className="flex-1"
                      onClick={handleSave}
                      icon={<IconTick className="scale-90" />}
                    >
                      {t('common.save')}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        toggle()
                        setTimeout(() => {
                          inputRef.current?.focus()
                        }, 333)
                      }}
                      icon={<IconEdit className="scale-90" />}
                    >
                      {t('common.edit')}
                    </Button>
                  )}
                  {/* <IconButton toolTipProps={{ title: '分享' }}>
                  <IconShare className="scale-90" />
                </IconButton> */}
                  <Button
                    className="flex-1"
                    onClick={handleDelete}
                    icon={<IconDelete className="scale-90" />}
                  >
                    {t('common.delete')}
                  </Button>
                </>
              )}
            </div>
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
