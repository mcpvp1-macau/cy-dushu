import CollapsedPage from '@/components/CollapsedPage'
import EditableNameHeader from '@/components/EditableNameHeader'
import { useSearchParams } from 'react-router-dom'
import TakeoffRef from './components/TakeoffRef'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import CalcAreaPath from './components/CalcAreaPath'
import HeightConfig from './components/HeightConfig'
import GoHomeHeightConfig from './components/GoHomeHeightConfig'
import SpeedConfig from './components/SpeedConfig'
import FinishActionConfig from './components/DoneActionConfig'
import InfoCard from './components/InfoCard'
import MainKConfig from './components/MainKConfig'
import Coverage from './components/Coverage'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from 'antd'

type PropsType = unknown

const PageAreaWaylineEdit: FC<PropsType> = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [taskName, setTaskName] = useState<string | null>(
    searchParams.get('name') ?? 'Wayline Name',
  )

  const { t } = useTranslation()

  const updateOpen = useAreaWaylineStore((s) => s.updateOpen)

  useEffect(() => {
    updateOpen(true)
    return () => {
      updateOpen(false)
    }
  }, [])

  return (
    <>
      <CollapsedPage>
        <div className="h-full flex flex-col">
          <EditableNameHeader
            className="px-3"
            value={taskName ?? '-'}
            onFinish={(v) => {
              setTaskName(v)
            }}
            onBackClick={() => navigate(-1)}
          />
          <ScrollArea className="flex-1">
            <div className="m-3">
              <InfoCard />
            </div>
            <div className="m-3">
              <TakeoffRef />
            </div>
            <div className="m-3">
              <MainKConfig />
            </div>
            <div className="m-3">
              <Coverage />
            </div>
            <div className="m-3">
              <HeightConfig />
            </div>
            <div className="m-3">
              <GoHomeHeightConfig />
            </div>
            <div className="m-3">
              <SpeedConfig />
            </div>
            <div className="m-3">
              <FinishActionConfig />
            </div>
            <div className="m-3 flex gap-3">
              <Button className="flex-1">{t('wayline.saveTask.title')}</Button>
              <Button type="primary" className="flex-1">
                {t('wayline.executeTask.title')}
              </Button>
            </div>
          </ScrollArea>
        </div>
      </CollapsedPage>
      <CalcAreaPath />
    </>
  )
})

PageAreaWaylineEdit.displayName = 'PageAreaWaylineEdit'

export default PageAreaWaylineEdit
