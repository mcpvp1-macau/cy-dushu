import IconReconstruction2D from '@/assets/icons/jsx/IconReconstruction2D'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import { Input } from 'antd'
import Reconstruction2DList from './Reconstruction2DList'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import { useDeferredValue } from 'react'

type PropsType = unknown

/** 地图 二维图 列表框 */
const Reconstruction2D: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle }] = useBoolean()
  const [kw, setKw] = useState('')
  const deferredKw = useDeferredValue(kw)
  const queryClient = useQueryClient()

  return (
    <>
      <FloatIconButton
        variant="borderless"
        tippyProps={{
          content: t('common.2dMap'),
          placement: 'left',
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
                  exact: true,
                })
              }}
            >
              <IconRefresh />
            </IconAsyncButton>
          }
          onClose={toggle}
        >
          <div className="m-3">
            <Input
              allowClear
              placeholder={t('poi_searcher.placeholder')}
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>
          <Reconstruction2DList searchKw={deferredKw} />
        </XModal>
      )}
    </>
  )
})

Reconstruction2D.displayName = 'Reconstruction2D'

export default Reconstruction2D
