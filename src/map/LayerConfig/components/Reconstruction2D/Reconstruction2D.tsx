import IconReconstruction2D from '@/assets/icons/jsx/IconReconstruction2D'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import { Input } from 'antd'
import Reconstruction2DList from './Reconstruction2DList'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = unknown

/** 地图 二维图 列表框 */
const Reconstruction2D: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle }] = useBoolean()
  const [kw, setKw] = useState('')
  const queryClient = useQueryClient()

  return (
    <>
      <FloatIconButton
        variant="borderless"
        toolTipProps={{
          title: t('common.2dMap'),
          placement: 'left',
          mouseEnterDelay: 0.5,
        }}
        active={open}
        onClick={toggle}
      >
        <IconReconstruction2D />
      </FloatIconButton>
      {open && (
        <XModal
          title={t('common.2dMap')}
          open={open}
          width={350}
          footer={false}
          noPadding
          titleRight={
            <IconAsyncButton
              className="scale-90"
              onClick={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ['reconstruction2dList'],
                })
              }}
            >
              <IconRefresh />
            </IconAsyncButton>
          }
          onClose={toggle}
        >
          <div className="m-3">
            <Input.Search
              allowClear
              placeholder={t('poi_searcher.placeholder')}
              onSearch={setKw}
            />
          </div>
          <Reconstruction2DList searchKw={kw} />
        </XModal>
      )}
    </>
  )
})

Reconstruction2D.displayName = 'Reconstruction2D'

export default Reconstruction2D
