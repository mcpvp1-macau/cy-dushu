import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'

type PropsType = {
  activeNav: number
  onActiveNavChange?: (index: number) => void
}

const AirlineAirpointNavbar: FC<PropsType> = memo(
  ({ activeNav, onActiveNavChange }) => {
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
          <span className="ml-1.5">航线设置</span>
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
          <MenuIconAirline />
          <span className="ml-1.5">航点设置</span>
        </button>
      </nav>
    )
  },
)

AirlineAirpointNavbar.displayName = 'AirlineAirpointNavbar'

export default AirlineAirpointNavbar
