import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

// 懒加载航线列表组件
const WaylineFolderList = lazy(() => import('./WaylineFolderList'))
const WaylineList = lazy(() => import('./WaylineList'))

type PropsType = unknown

/** 航线页面主入口，根据配置决定是否显示文件夹列表 */
const PageWayline: FC<PropsType> = memo(() => {
  // 根据配置决定使用哪个列表组件
  const ListComponent = globalConfig.useWaylineFolder
    ? WaylineFolderList
    : WaylineList

  return (
    <Suspense fallback={<Spin className="m-auto" />}>
      <ListComponent />
    </Suspense>
  )
})

PageWayline.displayName = 'PageWayline'

export default PageWayline
