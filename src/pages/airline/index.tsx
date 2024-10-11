import IconUpload from '@/assets/icons/jsx/IconUpload'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import CollapsedPage from '@/components/CollapsedPage'
import IconButton from '@/components/ui/button/IconButton'
import { memo, type FC } from 'react'
import AirlineTemplateList from './components/AirlineTemplateList'
import AddAirlineTemplate from './components/AddAirlineTemplate'

type PropsType = unknown

const PageAirline: FC<PropsType> = memo(() => {
  return (
    <CollapsedPage>
      <div className="h-full flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-solid border-ground-250">
          <div className="flex gap-1">
            <MenuIconAirline />
            <h2 className="text-white">航线</h2>
          </div>
          <div className="text-sm flex gap-3">
            <IconButton
              toolTipProps={{ title: '上传航线', mouseEnterDelay: 0.5 }}
            >
              <IconUpload />
            </IconButton>
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
