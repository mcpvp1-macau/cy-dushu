import IconWaypoint from '@/assets/icons/jsx/IconWaypoint'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'

type PropsType = {
  activeNav: number
  onActiveNavChange?: (index: number) => void
}

const Navbar: FC<PropsType> = memo(({ activeNav, onActiveNavChange }) => {
  const { t } = useTranslation()

  return (
    <nav className="flex gap-6 m-3">
      <button
        className={clsx(
          'text-fore pb-1 hover:text-primary border-b border-solid',
          {
            'text-primary  border-primary': activeNav === 0,
            'border-transparent': activeNav !== 0,
          },
        )}
        onClick={() => onActiveNavChange?.(0)}
      >
        <MenuIconAirline />
        <span className="ml-1.5">
          {t('wayline.waylineConfig.titleRebotDog')}
        </span>
      </button>
      <button
        className={clsx(
          'text-fore pb-1 hover:text-primary border-b border-solid',
          {
            'text-primary border-primary': activeNav === 1,
            'border-transparent': activeNav !== 1,
          },
        )}
        onClick={() => onActiveNavChange?.(1)}
      >
        <IconWaypoint />
        <span className="ml-1.5">
          {t('wayline.waylinePoint.configRebotDog')}
        </span>
      </button>
    </nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
