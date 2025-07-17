import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconReconstruction2D from '@/assets/icons/jsx/IconReconstruction2D'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import TagItemV2 from '@/components/ui/TagItemV2'
import FormModal from '@/components/XForm/Modal'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  deleteReconstruction2D,
  restartReconstruction2D,
  updateReconstruction2D,
} from '@/service/modules/reconstruction'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
} from '@ant-design/icons'

type PropsType = {
  data: API_RECONSTRUCTION.Reconstruction2DListItem
  hiddenSet: Set<number>
  statusMap: Record<string, string>
}

const typeMap = {
  PROCESSING: 'primary',
  FINISHED: 'success',
}

const iconMap = {
  PENDING: <ClockCircleOutlined />,
  PROCESSING: <SyncOutlined spin />,
  FINISHED: <CheckCircleOutlined />,
  PAUSE: <CloseCircleOutlined />,
}

const Recon2DListItem: FC<PropsType> = memo(
  ({ data, hiddenSet, statusMap }) => {
    const [isLoading, setIsLoading] = useState(false)
    const msgApi = useAppMsg()

    const queryClient = useQueryClient()
    const handleSuccess = () => {
      msgApi.success('操作成功')
      queryClient.invalidateQueries({
        queryKey: ['reconstruction2dList'],
        exact: true,
      })
    }

    const [editOpen, { setTrue, setFalse }] = useBoolean()

    return (
      <>
        <li>
          <div className="flex justify-between text-sm">
            <div className="flex gap-2">
              <IconReconstruction2D className="text-primary" />
              {data.name}
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                onClick={() => {
                  const newSet = new Set(hiddenSet)
                  if (newSet.has(data.id)) {
                    newSet.delete(data.id)
                  } else {
                    newSet.add(data.id)
                  }
                  useReconstruction2DMapStore
                    .getState()
                    .updateHiddenReconstruction2DSet(newSet)
                }}
              >
                {hiddenSet.has(data.id) ? <IconNotVisible /> : <IconVisible />}
              </IconButton>
              {isLoading ? (
                <LoadingOutlined />
              ) : (
                <>
                  <IconButton
                    className="scale-90"
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        await restartReconstruction2D(data.id)
                        handleSuccess()
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                  >
                    <IconRefresh />
                  </IconButton>
                  <IconButton className="scale-90" onClick={setTrue}>
                    <IconEdit />
                  </IconButton>
                  <IconButton
                    className="scale-90"
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        await deleteReconstruction2D(data.id)
                        handleSuccess()
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                  >
                    <IconDelete />
                  </IconButton>
                </>
              )}
            </div>
          </div>
          <div className="mt-1">
            <TagItemV2
              type={typeMap[data.status] || 'error'}
              icon={iconMap[data.status] || <CloseCircleOutlined />}
            >
              {statusMap[data.status]}
            </TagItemV2>
          </div>
        </li>
        {editOpen && (
          <FormModal
            title="修改名称"
            mask
            open={editOpen}
            items={[
              {
                label: '名称',
                type: 'input',
                name: 'name',
              },
            ]}
            initialValues={{
              name: data.name,
            }}
            onClose={setFalse}
            onConfirm={async (values) => {
              await updateReconstruction2D({
                id: data.id,
                name: values.name,
              })
              handleSuccess()
              setFalse()
            }}
          />
        )}
      </>
    )
  },
)

Recon2DListItem.displayName = 'Recon2DListItem'

export default Recon2DListItem
