import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import { ComponentRef, memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import useRightMode from '@/store/layout/useRightMode.store'
import AppEmpty from '@/components/AppEmpty'
import { shouldJson } from '@/utils/json'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Form, Input } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { CotType } from '@/store/map/useDraw.store'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconTick from '@/assets/icons/jsx/IconTick'
import useOverlayDetail from './useOverlayDetail'
import OverlayStyleEditor from '../AddGeometry/OverlayStyleEditor'
import { createPortal } from 'react-dom'

type PropsType = unknown

const RightOverlayDetail: FC<PropsType> = memo(() => {
  const detailId = useRightMode((s) => s.detailId)

  const { t } = useTranslation()

  const {
    isEdit,
    toggle,
    handleSave,
    handleDelete,
    isConfirmLoading,
    form,
    overlay,
    styleConfig,
  } = useOverlayDetail(detailId!, () => {
    updateRightMode(null)
  })

  const updateRightMode = useRightMode((s) => s.updateRightMode)

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

  return (
    <>
      <div className="w-[350px]">
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
                    <Input ref={inputRef} size="small" />
                  ) : (
                    <h6 className="text-hightlight text-base max-w-[190px] truncate">
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
                          toolTipProps={{ title: t('common.save') }}
                          onClick={handleSave}
                        >
                          <IconTick className="scale-90" />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        toolTipProps={{ title: t('common.edit') }}
                        onClick={() => {
                          toggle()
                          setTimeout(() => {
                            inputRef.current?.focus()
                          })
                        }}
                      >
                        <IconEdit className="scale-90" />
                      </IconButton>
                    )}
                    <IconButton
                      toolTipProps={{ title: t('common.delete') }}
                      onClick={handleDelete}
                    >
                      <IconDelete className="scale-90" />
                    </IconButton>
                  </>
                )}
              </div>
            </div>
          </CloseableHeader>

          {overlay ? (
            <div className="mx-3 mb-3 flex flex-col gap-2 text-sm">
              <p className="flex gap-2">
                {t('common.createTime')}:
                <span className="text-hightlight">{overlay.gmtCreate}</span>
              </p>
              <p className="flex gap-2">
                {t('overlay.detail.createUser.title')}:
                <span className="text-hightlight">{overlay.name}</span>
              </p>
              <p className="flex gap-2">
                {t('overlay.detail.position.title')}:
                <span className="text-hightlight">
                  {shouldJson(overlay.overlayPositions)?.[0]
                    ?.slice(0, 2)
                    ?.join(', ')}
                </span>
              </p>
              <p className="flex gap-2">
                <span className="whitespace-nowrap">
                  {t('overlay.detail.mark.title')}:
                </span>
                <Form.Item noStyle name="remarks">
                  {isEdit ? (
                    <Input size="small" className="h-5" />
                  ) : (
                    <span className="text-hightlight">
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

      {isEdit &&
        createPortal(
          <OverlayStyleEditor overlay={overlay!} />,
          document.querySelector('#global-map')!,
        )}
    </>
  )
})

RightOverlayDetail.displayName = 'RightPointDetail'

export default RightOverlayDetail
