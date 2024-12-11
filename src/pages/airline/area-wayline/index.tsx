import CollapsedPage from '@/components/CollapsedPage'
import EditableNameHeader from '@/components/EditableNameHeader'
import { useSearchParams } from 'react-router-dom'
import TakeoffRef from './components/TakeoffRef'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'

type PropsType = unknown

const PageAreaWaylineEdit: FC<PropsType> = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [taskName, setTaskName] = useState<string | null>(
    searchParams.get('name') ?? '航线名称',
  )

  const updateOpen = useAreaWaylineStore((s) => s.updateOpen)

  useEffect(() => {
    updateOpen(true)
    return () => {
      updateOpen(false)
    }
  }, [])

  return (
    <CollapsedPage>
      <EditableNameHeader
        className="px-3"
        value={taskName ?? '-'}
        onFinish={(v) => {
          setTaskName(v)
        }}
        onBackClick={() => navigate(-1)}
      />
      <div className="m-3">
        <TakeoffRef />
      </div>
    </CollapsedPage>
  )
})

PageAreaWaylineEdit.displayName = 'PageAreaWaylineEdit'

export default PageAreaWaylineEdit
