import IconButton from '../button/IconButton'
import IconDown from '@/assets/icons/jsx/IconDown'

type PropsType = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title?: ReactNode
  topRight?: ReactNode
  padding?: string
  iconMarginRight?: string
  titleIcon?: ReactNode
  children?: ReactNode
  header?: boolean
  collapsible?: boolean
  defaultCollapse?: boolean
}

const XCard: FC<PropsType> = ({
  title,
  titleIcon,
  topRight,
  children,
  header = true,
  collapsible = false,
  defaultCollapse = true,
  padding = '12px',
  iconMarginRight = '8px',
  ...otherProps
}) => {
  const [collapse, setCollapse] = useState(defaultCollapse)

  return (
    <div
      {...otherProps}
      className={clsx(
        'bg-[rgb(var(--ground-color-1))] border border-[rgb(var(--ground-color-5))] rounded-[3px] text-sm',
        otherProps.className,
      )}
      style={{ padding }}
    >
      {header && (
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex flex-1 items-center overflow-hidden">
            {titleIcon && (
              <div
                className="text-sm leading-[14px] text-fore-base mr-2"
                style={{ marginRight: iconMarginRight }}
              >
                {titleIcon}
              </div>
            )}
            <h4 className="m-0 flex-1 truncate p-0 text-left text-[rgb(var(--highlight-color))]">{title}</h4>
          </div>
          <div className="flex items-center">
            {topRight}
            {collapsible && (
              <IconButton onClick={() => setCollapse((prev) => !prev)}>
                <IconDown
                  style={{
                    transition: 'transform 300ms ease-in-out',
                    transform: `rotate(${collapse ? '0deg' : '-90deg'})`,
                  }}
                />
              </IconButton>
            )}
          </div>
        </div>
      )}
      {((collapsible && collapse) || !collapsible) && children}
    </div>
  )
}

export default XCard
