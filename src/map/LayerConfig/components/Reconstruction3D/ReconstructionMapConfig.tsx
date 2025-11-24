import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import { RightModeEnum } from '@/enum/right-mode'
import {
  deleteLayer,
  startBuild,
  startReconstructionTask,
} from '@/service/modules/reconstruction'
import useRightMode from '@/store/layout/useRightMode.store'
import { useReconstructionMapConfigStore } from '@/store/map/useReconstructionMap.store'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import EditReconstructionLayer from './EditReconstructionLayer'
import { Tooltip } from 'antd'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import { t } from 'i18next'
import TagItemV2 from '@/components/ui/TagItemV2'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = {
  data: API_RECONSTRUCTION.Layer
}

export const createReconstructionStatus = () => ({
  PENDING: t('mapLayer.reconstructionMap.layer.status.PENDING'),
  PROCESSING: t('mapLayer.reconstructionMap.layer.status.PROCESSING'),
  FINISHED: t('mapLayer.reconstructionMap.layer.status.FINISHED'),
  PAUSE: t('mapLayer.reconstructionMap.layer.status.PAUSE'),
})

const ReconstructionMapConfig: FC<PropsType> = memo((props) => {
  const data = props.data

  const { t } = useTranslation()

  const reconstructionStatus = useMemo(() => createReconstructionStatus(), [t])

  const rightMode = useRightMode((s) => s.rightMode)
  const rightDetailId = useRightMode((s) => s.detailId)

  const showLayerIds = useReconstructionMapConfigStore((s) => s.showLayerIds)
  const updateShowLayerIds = useReconstructionMapConfigStore(
    (s) => s.updateShowLayerIds,
  )

  const queryClient = useQueryClient()
  const handleDelte = async (overlayId: number) => {
    await deleteLayer(overlayId)
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-layerList'],
    })
    if (
      rightMode === RightModeEnum.RECONSTRUCTION_DETAIL &&
      rightDetailId == String(overlayId)
    ) {
      useRightMode.setState({ rightMode: null })
    }
  }

  const restartReconstruction = useMemoizedFn(
    async (data: API_RECONSTRUCTION.Layer) => {
      const res = await startReconstructionTask({
        deviceId: 'abc123', // 随便给一个，就是不能为空
        overlayId: data.overlayId,
        needFly: false,
      })
      const taskId = res.data
      await startBuild({
        taskId,
        bucket: globalConfig.bucketName || 'ja-media-storage',
        minioPath: data.imagesFolderPath,
      })
      await queryClient.invalidateQueries({
        queryKey: ['reconstruction-layerList'],
      })
    },
  )

  /**根据不同状态显示不同按钮 */
  const statusBtn = useMemoizedFn((data: API_RECONSTRUCTION.Layer) => {
    if (data.status === 'FINISHED') {
      return (
        <IconButton
          onClick={() => {
            if (showLayerIds.has(data.overlayId)) {
              showLayerIds.delete(data.overlayId)
            } else {
              showLayerIds.add(data.overlayId)
            }
            updateShowLayerIds(new Set(showLayerIds))
          }}
        >
          {showLayerIds.has(data.overlayId) ? (
            <IconVisible />
          ) : (
            <IconNotVisible />
          )}
        </IconButton>
      )
    } else if (data.status === 'PROCESSING' || data.status === 'PAUSE') {
      return (
        <IconAsyncButton
          tippyProps={{ content: t('mapLayer.reconstructionMap.task.restart') }}
          onClick={async () => await restartReconstruction(data)}
        >
          <IconRefresh className="cursor-pointer text-[14px]" />
        </IconAsyncButton>
      )
    }
  })

  const statusText = useMemoizedFn((data: API_RECONSTRUCTION.Layer) => {
    const statusMap = {
      PENDING: 'default',
      PROCESSING: 'primary',
      FINISHED: 'success',
      PAUSE: 'error',
    }

    const iconMap = {
      PENDING: <ClockCircleOutlined />,
      PROCESSING: <SyncOutlined spin />,
      FINISHED: <CheckCircleOutlined />,
      PAUSE: <CloseCircleOutlined />,
    }

    return (
      <TagItemV2 type={statusMap[data.status]} icon={iconMap[data.status]}>
        {reconstructionStatus[data.status]}
      </TagItemV2>
    )
  })

  return (
    <li>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <IconRebuild3d className="text-primary" />
          <p className="truncate w-[210px] overflow-hidden text-ellipsis  ">
            <Tooltip title={data.overlayName}>{data.overlayName}</Tooltip>
          </p>
        </div>
        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
          <>
            {statusBtn(data)}
            <EditReconstructionLayer data={data} />
            <IconAsyncButton
              className="scale-90"
              onClick={async () => await handleDelte(data.overlayId)}
            >
              <IconDelete />
            </IconAsyncButton>
          </>
        </div>
      </div>
      <div className="mt-1 ml-5">{statusText(data)}</div>
    </li>
  )
})

ReconstructionMapConfig.displayName = 'ReconstructionMapConfig'

export default ReconstructionMapConfig
