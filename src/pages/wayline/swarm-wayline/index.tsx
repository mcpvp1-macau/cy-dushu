import CollapsedPage from '@/components/CollapsedPage'
import EditableNameHeader from '@/components/EditableNameHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import useSwarmWaylineStore from '@/store/wayline/uav-swarm-wayline/useSwarmWayline.store'
import MainKConfig from './components/MainKConfig'
import Coverage from './components/Coverage'
import HeightConfig from './components/HeightConfig'
import SpeedConfig from './components/SpeedConfig'
import FinishActionConfig from './components/DoneActionConfig'
import GoHomeHeightConfig from './components/GoHomeHeightConfig'
import BottomButtions from './components/BottomButtions'
import useSwarmWaylineInit from './hooks/useWaylineInit'

type PropsType = unknown

/** 蜂群航线 */
const PageSwarmWaylineEdit: FC<PropsType> = memo(() => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const taskName = useSwarmWaylineStore((s) => s.templateConfig.taskName)
  const updateTemplateConfig = useSwarmWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const updateOpen = useSwarmWaylineStore((s) => s.updateOpen)

  useEffect(() => {
    updateOpen(true)
    return () => {
      updateOpen(false)
    }
  }, [])

  useSwarmWaylineInit()

  return (
    <>
      <CollapsedPage>
        <div className="h-full flex flex-col">
          <EditableNameHeader
            className="px-3"
            value={taskName || t('wayline.defaultTaskName.title')}
            onFinish={(v) => {
              updateTemplateConfig({
                ...useSwarmWaylineStore.getState().templateConfig,
                taskName: v,
              })
            }}
            onBackClick={() => navigate(-1)}
          />
          <ScrollArea className="flex-1">
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
            <div className="m-3">
              <BottomButtions />
            </div>
          </ScrollArea>
        </div>
      </CollapsedPage>
    </>
  )
})

PageSwarmWaylineEdit.displayName = 'PageSwarmWaylineEdit'

export default PageSwarmWaylineEdit
