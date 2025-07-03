import { borderedBtnClassName } from '.'
import IconMeasureTemperature from '@/assets/icons/jsx/IconMeasureTemperature'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { GetProps, Menu } from 'antd'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

const IrMeteringMode: FC<PropsType> = memo(({ postServiceFn }) => {
  const { t } = useTranslation()

  const irMeteringMode = useUavControlRoomStore((s) => s.state.irMeteringMode)

  const menuItems = useMemo<GetProps<typeof Menu>['items']>(() => {
    return [
      {
        key: 'CLOSE',
        label: (
          <div className={clsx('flex flex-col items-center text-xs')}>
            <span>{t('common.close')}</span>
          </div>
        ),
      },
      {
        key: 'POINT',
        label: (
          <div className={clsx('flex flex-col items-center text-xs')}>
            <span>{t('controlRoom.uav.service.irMeteringModeSet.point')}</span>
          </div>
        ),
      },
      {
        key: 'AREA',
        label: (
          <div className={clsx('flex flex-col items-center text-xs')}>
            <span>{t('controlRoom.uav.service.irMeteringModeSet.area')}</span>
          </div>
        ),
      },
    ]
  }, [irMeteringMode])

  return (
    <IconButtonWithDropDown
      className={borderedBtnClassName}
      tooltipProps={{
        title: t('controlRoom.uav.service.irMeteringModeSet.title'),
      }}
      menu={{
        items: menuItems,
        openKeys: [irMeteringMode ?? 'NEVER'],
        onClick: (info) => {
          postServiceFn('irMeteringModeSet', {
            irMeteringMode: info.key,
          })
        },
      }}
      active={irMeteringMode && irMeteringMode !== 'CLOSE'}
    >
      <IconMeasureTemperature />
    </IconButtonWithDropDown>
  )
})

IrMeteringMode.displayName = 'IrMeteringMode'

export default IrMeteringMode
