import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import CollapsedPage from '@/components/CollapsedPage'
import AirlineTemplateList from './components/AirlineTemplateList'
import AddAirlineTemplate from './components/AddAirlineTemplate'
import UploadAirlineTemplte from './components/UploadAirlineTemplate'

type PropsType = unknown

const PageAirline: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  return (
    <CollapsedPage>
      <div className="h-full flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-solid border-ground-250">
          <div className="flex gap-1">
            <MenuIconAirline />
            <h2 className="text-white">{t('wayline.title')}</h2>
          </div>
          <div className="text-sm flex gap-3">
            <UploadAirlineTemplte />
            <AddAirlineTemplate />
          </div>
        </header>
        <AirlineTemplateList />
      </div>
    </CollapsedPage>
  )
})

PageAirline.displayName = 'PageAirline'

export default PageAirline
