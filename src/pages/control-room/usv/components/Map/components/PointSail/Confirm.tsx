import PositionTooltip from '@/components/map/PositionTooltip'
import { Button } from 'antd'

type PropsType = {
  position: [number, number]
  onCancel: () => void
  onConfirm: () => void
}

const UsvPointSailConfirm: FC<PropsType> = memo(
  ({ position, onCancel, onConfirm }) => {
    const { t } = useTranslation()

    return (
      <PositionTooltip
        offset={[0, 30]}
        position={[position[0], position[1], 0]}
        alwayInViewport
      >
        <div className="p-2 flex flex-col gap-2 text-fore">
          <p>{t('usv.pointSail.confirmQuestion')}</p>
          <div className="flex justify-end gap-2">
            <Button size="small" onClick={onCancel}>
              {t('modal.cancel')}
            </Button>
            <Button size="small" type="primary" onClick={onConfirm}>
              {t('modal.confirm')}
            </Button>
          </div>
        </div>
      </PositionTooltip>
    )
  },
)

UsvPointSailConfirm.displayName = 'UsvPointSailConfirm'

export default UsvPointSailConfirm
