import usePointCloud3DWaylineInit from './hooks/useWaylineInit'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import EditableNameHeader from '@/components/EditableNameHeader'
import Navbar from '../rebot-dog-wayline/components/Navibar'
import WaylineConfig from './components/WaylineConfig'
import WaypointConfig from './components/WaypointConfig'
import PointCloud3DWaylineMap from './components/Map'
import BottomOperator from './components/ButtonOperator'
import { ScrollArea } from '@/components/ui/scroll-area'

type PropsType = unknown

const PointCloud3DWaylineEdit: FC<PropsType> = memo(() => {
  usePointCloud3DWaylineInit()
  const { t } = useTranslation()

  const taskName = usePointCloud3DWaylineStore(
    (s) => s.waylineTemplateInfo.taskName,
  )

  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState(0)

  return (
    <div className="page-full bg-ground-2 overflow-hidden flex">
      <div className="w-[350px] min-w-[350px] h-full flex flex-col">
        <EditableNameHeader
          className="px-3"
          value={taskName || t('wayline.defaultTaskName.title')}
          onFinish={(v) => {
            const sto = usePointCloud3DWaylineStore.getState()
            sto.updateWaylineTemplateInfo({
              ...sto.waylineTemplateInfo,
              taskName: v,
            })
          }}
          onBackClick={() => navigate(-1)}
        />
        <Navbar activeNav={activeNav} onActiveNavChange={setActiveNav} />
        <ScrollArea className="px-3 flex-1">
          {
            {
              0: <WaylineConfig />,
              1: <WaypointConfig />,
            }[activeNav]
          }
        </ScrollArea>
        <BottomOperator />
      </div>
      <div className="grow h-full overflow-hidden bg-slate-950">
        <PointCloud3DWaylineMap />
      </div>
    </div>
  )
})

PointCloud3DWaylineEdit.displayName = 'PointCloud3DWaylineEdit'

export default PointCloud3DWaylineEdit
