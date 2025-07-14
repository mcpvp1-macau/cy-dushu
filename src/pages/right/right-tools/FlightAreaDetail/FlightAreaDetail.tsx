import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import { ComponentRef, memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import AppEmpty from '@/components/AppEmpty'
import { shouldJson } from '@/utils/json'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Form, Input, Select, Tooltip, TreeSelect } from 'antd'
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { CotType } from '@/store/map/useDraw.store'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconTick from '@/assets/icons/jsx/IconTick'
import useFlightAreaDetail from './useFlightAreaDetail'
import OverlayStyleEditor from '../AddGeometry/OverlayStyleEditor'
import { createPortal } from 'react-dom'
import useUserStore, { type GroupDeviceTree } from '@/store/useUser.store'

type PropsType = unknown
// 无人机和无人机机场可以使用飞行区域
const usedFlightAreaDevice = ['UAV', 'UAV_AIRPORT']

const FlightAreaDetail: FC<PropsType> = memo(() => {
  const detailId = useRightMode((s) => s.detailId)

  const { t } = useTranslation()

  const overlayExtTypeOptions = [
    {
      label: t('flightArea.type.electronicFence.title'),
      value: 'ELECTRONIC_FENCE',
      info: t('flightArea.type.electronicFence.info'),
    },
    {
      label: t('flightArea.type.noFly.title'),
      value: 'NO_FLY_ZONE',
      info: t('flightArea.type.noFly.info'),
    },
    {
      label: t('flightArea.type.countZone.title'),
      value: 'AI_COUNT_ZONE',
      info: t('flightArea.type.countZone.info'),
    },
    {
      label: t('flightArea.type.noCountZone.title'),
      value: 'NO_COUNT_ZONE',
      info: t('flightArea.type.noCountZone.info'),
    },
  ]

  const {
    isEdit,
    toggle,
    handleSave,
    handleDelete,
    isConfirmLoading,
    form,
    overlay,
    relatedGroup,
    styleConfig,
  } = useFlightAreaDetail(detailId!, () => {
    updateRightMode(null)
  })

  const updateIsFlightArea = useMapDrawStore((s) => s.updateIsFlightArea)

  useEffect(() => {
    if (isEdit) {
      updateIsFlightArea(true)
    } else {
      updateIsFlightArea(false)
    }
  }, [isEdit])

  const updateRightMode = useRightMode((s) => s.updateRightMode)

  const inputRef = useRef<ComponentRef<typeof Input>>(null)

  const groupDeviceTree = useUserStore((s) => s.groupDeviceTree)
  /** 过滤掉除无人机和机场外的设备树，且去其中掉没有设备的组织 */
  const fliterGroupDeviceTree = useMemo(() => {
    // 先过滤掉除无人机和机场外的设备树
    const result: GroupDeviceTree[] = []
    usedFlightAreaDevice.forEach((key) => {
      const item = groupDeviceTree.find((e) => e.value === key)
      if (item) {
        result.push(item)
      }
    })

    /**递归的判断该组织下以及所有子组织是否有设备 */
    const hasDevice = (data: GroupDeviceTree[]) => {
      let has = false

      const recursiveFn = (data: GroupDeviceTree[]) => {
        data.forEach((item) => {
          if (item.type === 'DeviceItem') {
            has = true
            return
          }
          if (item.type === 'Group' && item.children.length === 0) {
            return
          } else {
            recursiveFn(item.children)
          }
        })
      }
      recursiveFn(data)

      return has
    }

    /**递归的删除没有设备的组织 */
    const deleteGroupWithoutDevice = (data: GroupDeviceTree[]) => {
      const tempResult: GroupDeviceTree[] = []
      data.forEach((item) => {
        if (item.type === 'DeviceType' || item.type === 'DeviceItem') {
          tempResult.push({
            ...item,
            children: deleteGroupWithoutDevice(item.children),
          })
        } else if (item.type === 'Group' && hasDevice(item.children)) {
          tempResult.push({
            ...item,
            children: deleteGroupWithoutDevice(item.children),
          })
        } else {
          // 没有设备的组织就不添加进新树中了
        }
      })
      return tempResult
    }

    return deleteGroupWithoutDevice(result)
  }, [groupDeviceTree])

  useEffect(() => {
    console.log(relatedGroup?.effectiveDevices?.split(',') || [])
  }, [relatedGroup])

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
                          }, 333)
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

              <p className="flex gap-2">
                {t('overlay.detail.createUser.title')}:
                <span className="text-white">{relatedGroup?.layerName}</span>
              </p>

              <p className="flex gap-2">
                <span className="whitespace-nowrap">
                  {t('flightArea.type.title')}:
                </span>
                <Form.Item noStyle name="overlayExtType">
                  {isEdit ? (
                    <Select
                      size="small"
                      className="h-5 w-[140px]"
                      options={overlayExtTypeOptions}
                      optionRender={(option, { index }) => {
                        return (
                          <div className="flex items-center gap-3">
                            <span>{option.label}</span>
                            <Tooltip title={overlayExtTypeOptions[index].info}>
                              <InfoCircleOutlined />
                            </Tooltip>
                          </div>
                        )
                      }}
                    />
                  ) : (
                    <span className="text-white">
                      {
                        overlayExtTypeOptions.find(
                          (item) =>
                            item.value === (overlay?.overlayExtType || ''),
                        )?.label
                      }
                    </span>
                  )}
                </Form.Item>
              </p>

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

              <p className="flex gap-2">
                <span className="whitespace-nowrap">
                  {t('flightArea.relatedGroup.effective.title')}:
                </span>
                <div>
                  <TreeSelect
                    size="small"
                    className="w-[240px]"
                    value={relatedGroup?.effectiveDevices?.split(',') || []}
                    defaultValue={
                      relatedGroup?.effectiveDevices?.split(',') || []
                    }
                    treeData={fliterGroupDeviceTree}
                    treeCheckable
                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                    allowClear
                    maxTagCount={6}
                    onChange={(value) => {}}
                  />
                </div>
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

FlightAreaDetail.displayName = 'FlightAreaDetail'

export default FlightAreaDetail
