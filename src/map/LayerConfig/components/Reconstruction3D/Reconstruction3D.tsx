import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import ReconstructionMapListConfig from './ReconstructionMapListConfig'
import AddReconstructionLayerGroup from './AddReconstructionLayerGroup'
import { Input } from 'antd'
import Select from '@/components/AntdOverride/Select'
import { createReconstructionStatus } from './ReconstructionMapConfig'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = unknown

const Reconstruction3D: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle, setFalse }] = useBoolean(false)
  const queryClient = useQueryClient()

  const [kw, setKw] = useState('')
  const [status, setStatus] = useState<string | undefined>(undefined)

  const reconstructionStatus = useMemo(() => createReconstructionStatus(), [t])

  return (
    <>
      <FloatIconButton
        active={open}
        toolTipProps={{
          title: t('common.threeMap'),
          placement: 'left',
          mouseEnterDelay: 0.5,
        }}
        variant="borderless"
        onClick={toggle}
      >
        <IconRebuild3d />
      </FloatIconButton>
      {open && (
        <XModal
          title={
            <div className="flex items-center gap-2">
              <IconRebuild3d />
              {t('common.threeMap')}
            </div>
          }
          titleRight={
            <IconAsyncButton
              className="scale-90"
              onClick={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ['reconstruction-layerList'],
                })
              }}
            >
              <IconRefresh />
            </IconAsyncButton>
          }
          open={open}
          width={350}
          noPadding
          footer={false}
          onClose={setFalse}
        >
          <div className="max-h-[75vh] flex flex-col overflow-hidden">
            <div className="m-3 flex gap-1">
              <Input.Search
                className="w-2/3"
                placeholder={t('poi_searcher.placeholder')}
                allowClear
                onSearch={setKw}
              />
              <Select
                className="w-1/3"
                options={Object.entries(reconstructionStatus).map(
                  ([key, value]) => ({
                    label: value,
                    value: key,
                  }),
                )}
                allowClear
                placeholder={t('common.all')}
                onChange={setStatus}
                value={status}
              />
            </div>
            <ReconstructionMapListConfig searchKw={kw} searchStatus={status} />
            <div className="p-3">
              <AddReconstructionLayerGroup />
            </div>
          </div>
        </XModal>
      )}
    </>
  )
})

Reconstruction3D.displayName = 'Reconstruction3D'

export default Reconstruction3D
