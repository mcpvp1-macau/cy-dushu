import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import CollapsedPage from '@/components/CollapsedPage'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { Input, Spin, Tooltip, Tree, TreeDataNode } from 'antd'
import { Fragment, useEffect, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getWaylineTemplateList,
  listWaylineFolder,
} from '@/service/modules/wayline'
import WaylineTemplateListItem, {
  WaylineIcon,
} from './components/WaylineTemplateListItem'
import useReachBottom from '@/hooks/useReachBottom'
import { useDebounceFn, useMemoizedFn, useUnmount } from 'ahooks'
import useWaylinesStore from '@/store/map/useWaylines.store'
import { isNil } from 'lodash'
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons'
import UploadWaylineTemplate from './components/UploadWaylineTemplate'
import AddWaylineTemplate from './components/AddWaylineTemplate'
import { useSearchParams } from 'react-router-dom'
import { WaylineEnum } from '@/constant/uav/wayline'
import clsx from 'clsx'
import AddWaylineFolder from './components/folder/AddWaylineFolder'

type PropsType = unknown

/** 航线类型选项配置 */
const WAYLINE_TYPE_OPTIONS = [
  {
    value: WaylineEnum.PointWayline,
    labelKey: 'wayline.create.form.waylineType.options.point.title',
  },
  {
    value: WaylineEnum.AreaWayline,
    labelKey: 'wayline.create.form.waylineType.options.area.title',
  },
  {
    value: WaylineEnum.SwarmWayline,
    labelKey: 'wayline.create.form.waylineType.options.swarm.title',
  },
  {
    value: WaylineEnum.PointCloud3DWayline,
    labelKey: 'wayline.create.form.waylineType.options.pointCloud3D.title',
  },
]

/** 航线模板文件夹列表 */
const WaylineFolderList: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // 从 URL 参数读取状态
  const keyword = searchParams.get('kw') || ''
  const selectedTaskTypes = searchParams.get('taskType') || ''
  const selectedFolderId = searchParams.get('folderId') || null

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

  /** 更新 URL 参数 */
  const updateSearchParams = useMemoizedFn(
    (key: string, value: string | null) => {
      const newParams = new URLSearchParams(searchParams)
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
      setSearchParams(newParams, { replace: true })
    },
  )

  /** 切换航线类型选择 */
  const toggleTaskType = useMemoizedFn((type: string) => {
    const currentTypes = selectedTaskTypes ? selectedTaskTypes.split(',') : []
    const index = currentTypes.indexOf(type)

    if (index === -1) {
      // 添加类型
      currentTypes.push(type)
    } else {
      // 移除类型
      currentTypes.splice(index, 1)
    }

    updateSearchParams('taskType', currentTypes.join(',') || null)
  })

  /** 选择文件夹 */
  const handleSelectFolder = useMemoizedFn((folderId: string | null) => {
    updateSearchParams('folderId', folderId)
  })

  /** 递归过滤文件夹节点，匹配关键字；父级匹配时显示完整子树 */
  const filterFolderNodes = useMemoizedFn(
    (
      nodes: API_AIRLINE.domain.WaylineFolderTreeNode[],
      kw: string,
    ): API_AIRLINE.domain.WaylineFolderTreeNode[] => {
      return nodes.reduce<API_AIRLINE.domain.WaylineFolderTreeNode[]>(
        (acc, node) => {
          const matchesSelf = node.folderName
            ?.toLowerCase()
            .includes(kw.toLowerCase())

          if (matchesSelf) {
            // 如果当前节点匹配，显示其完整子树
            acc.push(node)
            return acc
          }

          // 当前节点不匹配时，检查子节点是否有匹配
          const filteredChildren = node.children
            ? filterFolderNodes(node.children, kw)
            : []

          if (filteredChildren.length > 0) {
            // 有匹配的子节点时，保留父节点以维持树形结构
            acc.push({ ...node, children: filteredChildren })
          }

          return acc
        },
        [],
      )
    },
  )

  /** 收集所有文件夹 ID */
  const collectAllFolderIds = useMemoizedFn(
    (nodes: API_AIRLINE.domain.WaylineFolderTreeNode[]): string[] => {
      return nodes.flatMap((node) => [
        String(node.id),
        ...(node.children ? collectAllFolderIds(node.children) : []),
      ])
    },
  )

  // 过滤后的文件夹数据
  const filteredFolderData = useMemo(() => {
    if (!folderData || !keyword) {
      return folderData
    }
    return filterFolderNodes(folderData, keyword)
  }, [folderData, keyword, filterFolderNodes])

  // 所有可见文件夹 ID（用于判断当前选中是否可见）
  const visibleFolderIds = useMemo(() => {
    if (!filteredFolderData) return new Set<string>()
    return new Set(collectAllFolderIds(filteredFolderData))
  }, [filteredFolderData, collectAllFolderIds])

  // 当选中的文件夹被过滤掉时，切换到默认文件夹
  useEffect(() => {
    if (
      selectedFolderId &&
      keyword &&
      filteredFolderData &&
      !visibleFolderIds.has(selectedFolderId)
    ) {
      handleSelectFolder(null)
    }
  }, [
    selectedFolderId,
    keyword,
    filteredFolderData,
    visibleFolderIds,
    handleSelectFolder,
  ])

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
      // 使用过滤后的数据
      children: filteredFolderData ? buildTreeNodes(filteredFolderData) : [],
    }

    return [defaultFolder]
  }, [filteredFolderData, t])

  // 防抖搜索
  const { run: debouncedSearch } = useDebounceFn(
    (v: string) => {
      updateSearchParams('kw', v || null)
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
      queryKey: [
        'waylineTemplates',
        { keyword, folderId: selectedFolderId, taskType: selectedTaskTypes },
      ],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getWaylineTemplateList({
          currentPage: pageParam,
          isPage: true,
          size: 15,
          templateName: keyword || undefined,
          folderId: selectedFolderId || undefined,
          taskType: selectedTaskTypes || undefined,
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

  // 选中的航线类型数组
  const selectedTaskTypesArray = useMemo(() => {
    return selectedTaskTypes ? selectedTaskTypes.split(',') : []
  }, [selectedTaskTypes])

  /** 文件夹创建成功后刷新列表 */
  const handleFolderCreated = useMemoizedFn(() => {
    queryClient.invalidateQueries({ queryKey: ['waylineFolders'] })
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

          {/* 搜索框与航线类型筛选 */}
          <div className="flex items-center gap-2">
            <Input
              allowClear
              key={keyword}
              defaultValue={keyword}
              placeholder={t('wayline.folder.searchPlaceholder')}
              onChange={(evt) => debouncedSearch(evt.target.value)}
              className="flex-1"
            />

            {/* 航线类型多选图标 */}
            <div className="flex items-center gap-0.5 p-0.5 bg-ground-3 border border-solid border-ground-5 rounded box-border">
              {WAYLINE_TYPE_OPTIONS.map((option) => {
                const isSelected = selectedTaskTypesArray.includes(option.value)
                return (
                  <Tooltip key={option.value} title={t(option.labelKey)}>
                    <button
                      type="button"
                      onClick={() => toggleTaskType(option.value)}
                      className={clsx(
                        'size-6 rounded transition-colors text-base',
                        isSelected
                          ? 'bg-primary text-hightlight'
                          : 'text-fore hover:bg-ground-5',
                      )}
                    >
                      <WaylineIcon type={option.value} />
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </header>

        {/* 主体内容：左右两栏 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧文件夹列表 */}
          <div className="w-[250px] border-r border-solid border-ground-4 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-solid border-ground-4">
              <span className="text-sm text-fore">
                {t('wayline.folder.folderListTitle')}
              </span>
              <AddWaylineFolder
                parentFolderId={selectedFolderId}
                onSuccess={handleFolderCreated}
              />
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
                      handleSelectFolder(null)
                    } else {
                      handleSelectFolder(key as string)
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
              <div className="text-sm flex gap-3">
                <UploadWaylineTemplate />
                <AddWaylineTemplate />
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
                          <WaylineTemplateListItem
                            key={e.templateId}
                            data={e}
                          />
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
