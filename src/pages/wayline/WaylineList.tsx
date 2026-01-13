import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import CollapsedPage from '@/components/CollapsedPage'
import WaylineTemplateList from './components/WaylineTemplateList'
import AddWaylineTemplate from './components/AddWaylineTemplate'
import UploadWaylineTemplate from './components/UploadWaylineTemplate'

type PropsType = unknown

/** 航线模板主列表 */
const WaylineList: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  return (
    <CollapsedPage>
      <div className="h-full flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-solid border-ground-4">
          <div className="flex gap-1">
            <MenuIconAirline />
            <h2 className="text-hightlight">{t('wayline.title')}</h2>
          </div>
          <div className="text-sm flex gap-3">
            <UploadWaylineTemplate />
            <AddWaylineTemplate />
          </div>
        </header>
        <WaylineTemplateList />
      </div>
    </CollapsedPage>
  )
})

WaylineList.displayName = 'WaylineList'

export default WaylineList
