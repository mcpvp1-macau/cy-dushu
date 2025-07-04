import IconReconstruction2D from '@/assets/icons/jsx/IconReconstruction2D'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import { Input } from 'antd'
import Reconstruction2DList from './Reconstruction2DList'

type PropsType = unknown

const Reconstruction2D: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle }] = useBoolean()
  const [kw, setKw] = useState('')

  return (
    <>
      <FloatIconButton variant="borderless">
        <IconReconstruction2D onClick={toggle} />
      </FloatIconButton>
      {open && (
        <XModal
          title="二维图"
          open={open}
          width={350}
          footer={false}
          noPadding
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
