import { Checkbox, Input, Radio } from 'antd'
import AppSpin from '@/components/AppSpin'
import { getActionList } from '@/service/modules/action'
import ActionItem from './components/ActionItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import AddAction from './components/AddAction'
import { useInfiniteQuery } from '@tanstack/react-query'
import useReachBottom from '@/hooks/useReachBottom'
import React from 'react'
import AppEmpty from '@/components/AppEmpty'
import IconButtonWithDropDownDialog from '@/components/ui/button/IconButtonWithDropDownDialog'
import { LoadingOutlined } from '@ant-design/icons'
import IconFilter from '@/assets/icons/jsx/IconFilter'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'

type PropsType = unknown

const PageSituationAction: FC<PropsType> = memo(() => {
  const [name, setName] = useState('')

  const [actionType, setActionType] = useState<string | undefined>(undefined)
  const [processStatusList, setProcessStatusList] = useState<string[]>([
    'PENDING',
    'PROCESSING',
  ])

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)

  const actionTypeMap = useMemo(() => {
    return actionTypeOptions.reduce((acc, item) => {
      acc[item.value] = item.label
      return acc
    }, {} as Record<string, string>)
  }, [actionTypeOptions])

  console.log('actionTypeOptions', actionTypeOptions)

  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    {
      queryKey: ['actionList', name, actionType, processStatusList],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getActionList({
          name: name || undefined,
          status:
            processStatusList.length > 0
              ? processStatusList
              : ['PENDING', 'PROCESSING'],
          type: actionType,
          isPage: true,
          page: pageParam,
          size: 15,
        })
        return data
      },
      getNextPageParam: (page, _, lastPageParam) => {
        if (page.rows.length < 15) {
          return undefined
        }
        return lastPageParam + 1
      },
      gcTime: 0, // 避免无限轮播, 后续切换页面时, 导致多次请求
    },
    queryClient,
  )

  const handleScroll = useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }

  const { t } = useTranslation()

  return (
    <div className="h-full flex flex-col my-3 overflow-hidden">
      <div className="flex items-center gap-3 px-3">
        <Input
          placeholder={t('action.input.placeholder')}
          onPressEnter={handlePressEnter}
        />
        <IconButtonWithDropDownDialog
          title={'行动筛选'}
          tooltipProps={{ title: '行动筛选' }}
          trigger={['click']}
          popupRender={() => (
            <div className="p-2">
              <div className="flex gap-2 items-center mb-1">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">{'行动类型'}</span>
              </div>
              <div>
                <Radio.Group
                  options={[
                    {
                      label: '全部',
                      value: undefined,
                    },
                    ...actionTypeOptions,
                  ]}
                  onChange={(e) => setActionType(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center mt-3 mb-1">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">{'行动状态'}</span>
              </div>

              <div>
                <Checkbox.Group
                  options={[
                    {
                      label: '未开始',
                      value: 'PENDING',
                    },
                    {
                      label: '进行中',
                      value: 'PROCESSING',
                    },
                  ]}
                  onChange={setProcessStatusList}
                />
              </div>
            </div>
          )}
        >
          {isLoading ? <LoadingOutlined /> : <IconFilter />}
        </IconButtonWithDropDownDialog>
      </div>
      <ScrollArea className="grow mt-3 px-3" onScroll={handleScroll}>
        {isLoading || isRefetching || !data ? (
          <AppSpin />
        ) : data.pages?.[0]?.rows.length === 0 ? (
          <AppEmpty />
        ) : (
          <div className="flex flex-col gap-3">
            {data.pages.map((page, idx) => (
              <React.Fragment key={idx}>
                {page.rows.map((item) => (
                  <ActionItem
                    key={item.id}
                    data={item}
                    actionType={actionTypeMap[item.type]}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
        {isFetchingNextPage && <AppSpin />}
      </ScrollArea>
      <div className="mt-3 text-center">
        <AddAction />
      </div>
    </div>
  )
})

PageSituationAction.displayName = 'PageAction'

export default PageSituationAction
