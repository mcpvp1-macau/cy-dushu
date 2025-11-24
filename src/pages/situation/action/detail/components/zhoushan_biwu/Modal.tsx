import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import { delAIResult } from '@/service/modules/action'
import AppEmpty from '@/components/AppEmpty'
import { useSize } from 'ahooks'
import { Checkbox, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import { useAIResult } from '../AIResult'
import useActionDetail from '../../context'
import AIResultItem from './AIResultItem'
import { ComponentRef } from 'react'

type PropsType = {
  actionId: string
  actionType: string
  detail?: API_ACTION.domain.ActionDetail
  isBacktracking?: boolean
}

/** 舟山比武 对话框 */
const ZSBIWUModal: FC<PropsType> = memo(({ actionId }) => {
  const [open, setOpen] = useState(false)

  const actionDetail = useActionDetail()

  const { data, isLoading, isRefetching, refetch } = useAIResult(
    actionId,
    actionDetail?.actionRecordId,
  )

  const size = useSize(document.body)
  const isBigWindow = useMemo(() => (size?.width ?? 0) >= 980, [size?.width])

  const [checkIds, _setCheckIds] = useState<string[]>([])

  const setCheckIds = useMemoizedFn((ids: string[]) => {
    _setCheckIds(ids)
  })

  const handleCheckAllChange = useMemoizedFn((e: CheckboxChangeEvent) => {
    setCheckIds(e.target.checked ? data?.map((e) => e.id) ?? [] : [])
  })

  const componentMap = useRef<{
    [id: string]: ComponentRef<typeof AIResultItem>
  }>({})

  if (isLoading || !data || !actionDetail) {
    return <LoadingOutlined />
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={() => setOpen(true)}>
        <IconEdit />
      </IconButton>
      {!isLoading && data && actionDetail && (
        <>
          <XModal
            width={isBigWindow ? '960px' : '480px'}
            title="检测结果"
            centered
            open={open}
            footer={false}
            noPadding
            onClose={() => setOpen(false)}
          >
            <Spin spinning={isRefetching}>
              <div className="p-3">
                <div className="py-3 bg-ground-3 rounded">
                  <div className="flex justify-between px-3">
                    <p className="flex gap-3">
                      <Checkbox
                        indeterminate={
                          checkIds.length > 0 && checkIds.length < data.length
                        }
                        checked={checkIds.length === data.length}
                        onChange={handleCheckAllChange}
                      >
                        全选
                      </Checkbox>

                      <IconButton
                        disabled={checkIds.length === 0}
                        tippyProps={{ content: '下载全部' }}
                        onClick={() => {
                          for (const id of checkIds) {
                            const component = componentMap.current[id]
                            if (component) {
                              component.downloadImage()
                            }
                          }
                        }}
                      >
                        <DownloadOutlined />
                      </IconButton>

                      <IconAsyncButton
                        tippyProps={{ content: '删除' }}
                        disabled={checkIds.length === 0}
                        onClick={async () => {
                          await delAIResult(actionId, checkIds)
                          await refetch()
                          setCheckIds([])
                        }}
                      >
                        <IconDelete />
                      </IconAsyncButton>
                    </p>
                  </div>
                  {data.length === 0 ? (
                    <AppEmpty />
                  ) : (
                    <Checkbox.Group value={checkIds} onChange={setCheckIds}>
                      <ul className="px-3 w-full pt-3 flex justify-between flex-wrap gap-y-3 max-h-[408px] overflow-y-auto overflow-x-hidden">
                        {data.map((e) => (
                          <li key={e.id} className="w-[440px]">
                            <AIResultItem
                              data={e}
                              ref={(ref) =>
                                ref && (componentMap.current[e.id] = ref)
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </Checkbox.Group>
                  )}
                </div>
              </div>
            </Spin>
          </XModal>
        </>
      )}
    </div>
  )
})

ZSBIWUModal.displayName = 'ZSKCYPModal'

export default ZSBIWUModal
