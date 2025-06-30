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

type PropsType = {
  searchKw?: string
  searchStatus?: string
}

/** 三维重建 列表 */
const ReconstructionMapListConfig: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()

  const layerGroupList = useReconstructionMap((s) => s.layerGroupList)
  const layerList = useReconstructionMap((s) => s.layerList)

  const defaultExpandLayerIds = useMemo(() => {
    return layerGroupList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.id)
  }, [layerList])

  /**分组后的layerList */
  const layerListGroup = useMemo(() => {
    const grouped = groupBy(layerList, 'layerId')
    for (const key in grouped) {
      grouped[key] = grouped[key].filter(
        (e) =>
          e.overlayName.includes(props.searchKw ?? '') &&
          (!props.searchStatus || e.status === props.searchStatus),
      )
    }
    return grouped
  }, [layerList, props.searchKw, props.searchStatus])

  const showLayerIds = useReconstructionMapConfigStore((s) => s.showLayerIds)
  const updateShowLayerIds = useReconstructionMapConfigStore(
    (s) => s.updateShowLayerIds,
  )

  const showGroupIds = useMemo(() => {
    const showGroupIds = new Set<number>()

    const finishedLayerList = layerList.filter((e) => e.status === 'FINISHED')

    finishedLayerList.forEach((e) => {
      if (
        !layerListGroup[e.layerId]?.every((o) => !showLayerIds.has(o.overlayId))
      ) {
        showGroupIds.add(e.layerId)
      }
    })
    return showGroupIds
  }, [layerList, layerListGroup, showLayerIds])

  /**更新图层组内重建图层的显示状态 */
  const updateShow = useMemoizedFn((groupId: number, show: boolean) => {
    const newShowLayerIds = new Set(showLayerIds)

    if (show) {
      layerListGroup[groupId]?.forEach((e) => {
        e.status === 'FINISHED' && newShowLayerIds.add(e.overlayId)
      })
    } else {
      layerListGroup[groupId]?.forEach((e) => {
        newShowLayerIds.delete(e.overlayId)
      })
    }
    updateShowLayerIds(newShowLayerIds)
  })

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
          for (let i = 0; i < files.length; i++) {
            const file = files.item(i)!
            if (file.type.startsWith('image')) {
              const name = file.name

              return file.webkitRelativePath.replace('/' + name, '')
            }
          }

          return false
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
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleCreate = useMemoizedFn((id: number) => {
    setCreateOpen(true)
    setCreateLayerId(id)
  })
  // /storage/ja-media-storage/W1029/input
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
        bucket: 'ja-media-storage',
        // 文件上传minio需要加input，但是任务不能给
        minioPath: form.minioPath.replace('/input', ''),
      })
      msgApi.success(t('mapLayer.reconstructionMap.create.overlay.start'))
      setCreateOpen(false)
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
                  updateShow(layerGroup.id, !showGroupIds.has(layerGroup.id))
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
          mask
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
