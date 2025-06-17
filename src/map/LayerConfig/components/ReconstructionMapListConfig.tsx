import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import useReconstructionMap, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import { groupBy } from 'lodash'
import ReconstructionMapConfig from './ReconstructionMapConfig'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  createLayer,
  deleteLayerGroupList,
  startReconstructionTask,
  startBuild,
} from '@/service/modules/reconstruction'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { CotType } from '@/store/map/useDraw.store'

const ReconstructionMapListConfig: FC = memo(() => {
  const { t } = useTranslation()

  const layerGroupList = useReconstructionMap((s) => s.layerGroupList)
  const layerList = useReconstructionMap((s) => s.layerList)

  const defaultExpandLayerIds = useMemo(() => {
    return layerGroupList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.id)
  }, [layerList])

  /**分组后的layerList */
  const layerListGroup = useMemo(
    () => groupBy(layerList, 'layerId'),
    [layerList],
  )

  const showGroupIds = useReconstructionMapConfigStore((s) => s.showGroupIds)
  const updateShowGroupIds = useReconstructionMapConfigStore(
    (s) => s.updateShowGroupIds,
  )

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleDelGroup = async (id: number) => {
    await deleteLayerGroupList(id)
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-groupList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  const items = useMemo<XFormItem[]>(
    () => [
      {
        label: t('mapLayer.reconstructionMap.create.overlay.form.overlayName'),
        name: 'overlayName',
        type: 'input',
      },
      {
        label: t('mapLayer.reconstructionMap.create.overlay.form.uploadLabel'),
        name: 'minioPath',
        type: 'upload-minio',
        rules: [{ required: true }],
        getPath: (files: FileList) => {
          const path = files.item(0)!.webkitRelativePath.split('/')[0]

          const randomPath = `map${Math.random()
            .toString(36)
            .slice(2)}/${path}/input`
          setUploadPath(randomPath)
          return randomPath
        },
        filesFilter: (files: FileList) => {
          const newFiles: File[] = []
          for (let i = 0; i < files.length; i++) {
            const file = files.item(i)
            if (file?.type.startsWith('image')) {
              newFiles.push(file)
            }
          }

          return newFiles
        },
      },
    ],
    [],
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [createLayerId, setCreateLayerId] = useState<any>()
  const [uploadPath, setUploadPath] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleCreate = useMemoizedFn((id: number) => {
    setCreateOpen(true)
    setCreateLayerId(id)
  })

  const handleConfirmCreate = async (form: any) => {
    setConfirmLoading(true)
    try {
      const overlayRes = await createLayer({
        overlayName: form.overlayName,
        layerId: createLayerId,
        overlayType: 'CIRCULAR',
        overlayBindType: 'NORMAL',
        overlayStyleConfig: '',
        cotType: CotType.SHAPE_CIRCLE,
      })
      const overlayId = overlayRes.data.overlayId
      const taskRes = await startReconstructionTask({
        deviceId: '123',
        overlayId,
        needFly: false,
      })
      await startBuild({
        taskId: taskRes.data,
        bucket: 'minio-map',
        // 文件上传minio需要加input，但是任务不能给
        minioPath: uploadPath.replace('/input', ''),
      })
      msgApi.success(t('mapLayer.reconstructionMap.create.overlay.start'))
      setCreateOpen(false)
      setUploadPath('')
      setConfirmLoading(false)
    } catch (error) {
      msgApi.error(t('mapLayer.reconstructionMap.create.overlay.failed'))
      setCreateOpen(false)
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <AppCollapse
        defaultActiveKey={defaultExpandLayerIds}
        accordion
        items={layerGroupList.map((layerGroup) => ({
          key: layerGroup.id,
          label: ` - ${layerGroup.layerName}`,
          extra: (
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              <IconButton
                onClick={() => {
                  if (showGroupIds.has(layerGroup.id)) {
                    showGroupIds.delete(layerGroup.id)
                  } else {
                    showGroupIds.add(layerGroup.id)
                  }
                  updateShowGroupIds(new Set(showGroupIds))
                }}
              >
                {showGroupIds.has(layerGroup.id) ? (
                  <IconVisible />
                ) : (
                  <IconNotVisible />
                )}
              </IconButton>

              <IconButton
                toolTipProps={{
                  title: t('mapLayer.reconstructionMap.create.overlay.title'),
                }}
                onClick={() => handleCreate(layerGroup.id)}
              >
                <IconPlus />
              </IconButton>

              {layerGroup.layerType !== 'DEFAULT' && (
                <IconButton
                  className="scale-90"
                  onClick={() => handleDelGroup(layerGroup.id)}
                >
                  <IconDelete />
                </IconButton>
              )}
            </div>
          ),
          children: (
            <ul className="p-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {(layerListGroup[layerGroup.id] ?? []).length === 0 ? (
                <AppEmpty />
              ) : (
                (layerListGroup[layerGroup.id] ?? []).map((e) => (
                  <ReconstructionMapConfig key={e.overlayId} data={e} />
                ))
              )}
            </ul>
          ),
        }))}
      />

      {createOpen && (
        <FormModal
          title={t('mapLayer.reconstructionMap.create.overlay.title')}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          items={items}
          onConfirm={handleConfirmCreate}
          confirmLoading={confirmLoading}
        />
      )}
    </>
  )
})

ReconstructionMapListConfig.displayName = 'ReconstructionMapListConfig'

export default ReconstructionMapListConfig
