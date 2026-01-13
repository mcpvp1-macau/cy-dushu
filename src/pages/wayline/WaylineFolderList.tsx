import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import CollapsedPage from '@/components/CollapsedPage'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { Input, Spin, Tree, TreeDataNode } from 'antd'
import { Fragment, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getAirlineTemplateList,
  listWaylineFolder,
} from '@/service/modules/airline'
import { WaylineIcon } from './components/AirlineTemplateListItem'
import OverflowText from '@/components/ui/OverflowText'
import useReachBottom from '@/hooks/useReachBottom'
import { useDebounceFn, useUnmount } from 'ahooks'
import useWaylinesStore from '@/store/map/useWaylines.store'
import { isNil } from 'lodash'
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons'

type PropsType = unknown

const WaylineFolderList: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // 搜索关键字
  const [keyword, setKeyword] = useState('')
  // 当前选中的文件夹 ID，null 表示全部
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  // 展开的文件夹
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['default'])

  // 查询文件夹列表
  const { data: folderData, isLoading: isFolderLoading } = useQuery({
    queryKey: ['waylineFolders'],
    queryFn: async () => {
      const { data } = await listWaylineFolder({})
      return data
    },
  })

  // 构建树形数据
  const treeData: TreeDataNode[] = useMemo(() => {
    const buildTreeNodes = (
      nodes: API_AIRLINE.domain.WaylineFolderTreeNode[],
    ): TreeDataNode[] => {
      return nodes.map((node) => ({
        key: String(node.id),
        title: node.folderName,
        icon: ({ expanded }: { expanded?: boolean }) =>
          expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
        children:
          node.children && node.children.length > 0
            ? buildTreeNodes(node.children)
            : undefined,
      }))
    }

    const defaultFolder: TreeDataNode = {
      key: 'default',
      title: t('wayline.folder.defaultFolder'),
      icon: ({ expanded }: { expanded?: boolean }) =>
        expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: folderData ? buildTreeNodes(folderData) : [],
    }

    return [defaultFolder]
  }, [folderData, t])

  // 防抖搜索
  const { run: debouncedSearch } = useDebounceFn(
    (v: string) => {
      setKeyword(v)
    },
    { wait: 500 },
  )

  // 查询航线列表
  const {
    data: waylineData,
    isLoading: isWaylineLoading,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
  } = useInfiniteQuery(
    {
      queryKey: ['airlineTemplates', { keyword, folderId: selectedFolderId }],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getAirlineTemplateList({
          currentPage: pageParam,
          isPage: true,
          size: 15,
          templateName: keyword || undefined,
          folderId: selectedFolderId || undefined,
        })
        return data
      },
      getNextPageParam: (page, _, lastPageParam) => {
        if (page.rows.length < 15) {
          return undefined
        }
        return lastPageParam + 1
      },
    },
    queryClient,
  )

  // 滚动加载
  const handleScroll = useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  // 计算航线总数
  const totalWaylines = useMemo(() => {
    return (
      waylineData?.pages.reduce((acc, page) => acc + page.rows.length, 0) ?? 0
    )
  }, [waylineData])

  useUnmount(() => {
    useWaylinesStore.getState().setPreviewedWayline(null)
  })

  return (
    <CollapsedPage width={550}>
      <div className="h-full flex flex-col">
        {/* 顶部标题和搜索栏 */}
        <header className="p-3 border-b border-solid border-ground-4">
          <div className="flex gap-1 mb-3">
            <MenuIconAirline />
            <h2 className="text-hightlight">{t('wayline.folder.title')}</h2>
          </div>
          <Input
            allowClear
            placeholder={t('wayline.folder.searchPlaceholder')}
            onChange={(evt) => debouncedSearch(evt.target.value)}
          />
        </header>

        {/* 主体内容：左右两栏 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧文件夹列表 */}
          <div className="w-[250px] border-r border-solid border-ground-4 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-solid border-ground-4">
              <span className="text-sm text-fore">
                {t('wayline.folder.folderListTitle')}
              </span>
              <button className="text-fore hover:text-primary">+</button>
            </div>
            <ScrollArea className="flex-1">
              {isFolderLoading ? (
                <AppSpin />
              ) : (
                <Tree
                  showIcon
                  defaultExpandAll
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                  selectedKeys={
                    selectedFolderId ? [selectedFolderId] : ['default']
                  }
                  onSelect={(keys) => {
                    const key = keys[0]
                    if (key === 'default') {
                      setSelectedFolderId(null)
                    } else {
                      setSelectedFolderId(key as string)
                    }
                  }}
                  treeData={treeData}
                  className="bg-transparent p-2"
                />
              )}
            </ScrollArea>
          </div>

          {/* 右侧航线列表 */}
          <div className="flex flex-col overflow-hidden w-[350px]">
            <div className="flex justify-between items-center p-3 border-b border-solid border-ground-4">
              <span className="text-sm text-fore">
                {t('wayline.folder.waylineListTitle')} ({totalWaylines})
              </span>
              <div className="flex gap-2">
                <button className="text-fore hover:text-primary">↑</button>
                <button className="text-fore hover:text-primary">+</button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-3" onScroll={handleScroll}>
              {isWaylineLoading ? (
                <AppSpin />
              ) : isNil(waylineData?.pages.at(-1)) ||
                waylineData?.pages.at(0)?.rows.length === 0 ? (
                <AppEmpty />
              ) : (
                <Spin spinning={isRefetching}>
                  <ul className="flex flex-col gap-3">
                    {waylineData?.pages.map((page, index) => (
                      <Fragment key={index}>
                        {page.rows.map((e) => (
                          <WaylineListItem key={e.templateId} data={e} />
                        ))}
                      </Fragment>
                    ))}
                  </ul>
                </Spin>
              )}
              {isFetchingNextPage && <AppSpin />}
            </ScrollArea>
          </div>
        </div>
      </div>
    </CollapsedPage>
  )
})

WaylineFolderList.displayName = 'WaylineFolderList'

export default WaylineFolderList

// 航线列表项组件
type WaylineListItemProps = {
  data: API_AIRLINE.domain.AIRLINE_TEMPLATE
}

const WaylineListItem: FC<WaylineListItemProps> = memo(({ data }) => {
  const { t } = useTranslation()

  return (
    <li className="card-border text-sm p-2 bg-ground-2">
      <div className="flex gap-2 items-center">
        <WaylineIcon type={data.taskType} />
        <OverflowText className="text-hightlight flex-1 truncate">
          {data.taskName}
        </OverflowText>
      </div>
      <p className="text-xs mt-1 text-fore/70">
        {t('wayline.regenerator.title')}: {data.gmtModifiedBy}
      </p>
      <p className="text-xs mt-1 text-fore/70">
        {t('common.updateTime')}: {data.gmtModified}
      </p>
    </li>
  )
})

WaylineListItem.displayName = 'WaylineListItem'
