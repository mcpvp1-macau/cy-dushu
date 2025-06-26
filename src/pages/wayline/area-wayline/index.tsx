import CollapsedPage from '@/components/CollapsedPage'
import EditableNameHeader from '@/components/EditableNameHeader'
import TakeoffRef from './components/TakeoffRef'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import CalcAreaPath from './components/CalcAreaPath'
import HeightConfig from './components/HeightConfig'
import GoHomeHeightConfig from './components/GoHomeHeightConfig'
import SpeedConfig from './components/SpeedConfig'
import FinishActionConfig from './components/DoneActionConfig'
import InfoCard from './components/InfoCard'
import MainKConfig from './components/MainKConfig'
import Coverage from './components/Coverage'
import { ScrollArea } from '@/components/ui/scroll-area'
import BottomButtions from './components/BottomButtions'
import useAirlineInit from './hooks/useWaylineInit'
import CameraModeConfig from './components/CameraModeConfig'
import GSDConfig from './components/GSDConfig'

type PropsType = unknown

const PageAreaWaylineEdit: FC<PropsType> = memo(() => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const taskName = useAreaWaylineStore((s) => s.templateConfig.taskName)
  const updateTemplateConfig = useAreaWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const updateOpen = useAreaWaylineStore((s) => s.updateOpen)

  useAirlineInit()

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
            value={taskName || t('wayline.defaultTaskName.title')}
            onFinish={(v) => {
              updateTemplateConfig({
                ...useAreaWaylineStore.getState().templateConfig,
                taskName: v,
              })
            }}
            onBackClick={() => navigate(-1)}
          />
          <ScrollArea className="flex-1">
            <div className="m-3">
              <InfoCard />
            </div>
            <div className="m-3">
              <GSDConfig />
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
              <CameraModeConfig />
            </div>
            <div className="m-3">
              <FinishActionConfig />
            </div>
            <div className="m-3 ">
              <BottomButtions />
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
