import IconButtonWithDropDownDialog from '@/components/ui/button/IconButtonWithDropDownDialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from 'antd'
import { isNil } from 'lodash'
import { BugOutlined } from '@ant-design/icons'
import type { ChangeEvent } from 'react'

type DebugStateProps = {
  state?: Record<string, unknown> | null
}

const DebugState: FC<DebugStateProps> = memo(({ state }) => {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')

  const handleKeywordChange = useMemoizedFn(
    (event: ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value)
    },
  )

  const trimmedKeyword = keyword.trim()
  const filteredState = useMemo(() => {
    // 关键词为空时直接展示完整状态
    if (!trimmedKeyword) {
      return state ?? {}
    }

    const normalizedKeyword = trimmedKeyword.toLowerCase()

    const filterValue = (value: unknown): unknown => {
      if (Array.isArray(value)) {
        const filteredArray = value
          .map((item) => filterValue(item))
          .filter((item) => !isNil(item))

        return filteredArray.length ? filteredArray : undefined
      }

      if (!value || typeof value !== 'object') {
        return undefined
      }

      const result: Record<string, unknown> = {}

      Object.entries(value).forEach(([key, val]) => {
        const keyMatched = key.toLowerCase().includes(normalizedKeyword)

        // 仅按字段名过滤，命中父级字段时保留其子结构
        if (keyMatched) {
          result[key] = val
          return
        }

        const filteredChild = filterValue(val)

        if (!isNil(filteredChild)) {
          result[key] = filteredChild
        }
      })

      return Object.keys(result).length ? result : undefined
    }

    return filterValue(state) ?? {}
  }, [state, trimmedKeyword])

  return (
    <li className="flex gap-1 select-none">
      <IconButtonWithDropDownDialog
        title={t('common.debug')}
        trigger={['click']}
        useDing
        autoAdjustOverflow
        tippyProps={{ content: t('common.debug') }}
        destroyOnHidden
        popupRender={() => (
          <div className="flex flex-col gap-2 p-2 text-xs">
            <Input
              allowClear
              size="small"
              placeholder={t('controlRoom.uav.header.debug.filterPlaceholder', {
                defaultValue: '过滤字段',
              })}
              value={keyword}
              onChange={handleKeywordChange}
            />
            <ScrollArea className="max-h-[70vh]">
              <pre>
                <code>{JSON.stringify(filteredState, null, 2)}</code>
              </pre>
            </ScrollArea>
          </div>
        )}
      >
        <BugOutlined />
      </IconButtonWithDropDownDialog>
    </li>
  )
})

DebugState.displayName = 'DebugState'

export default DebugState
