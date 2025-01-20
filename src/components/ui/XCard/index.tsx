import styles from './index.module.less'
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
      className={clsx(styles['x-card-fake-hash'], otherProps.className)}
      style={{ padding }}
    >
      {header && (
        <div className="x-card-header">
          <div className="left">
            {titleIcon && (
              <div
                className="text-sm leading-[14px] text-fore-base mr-2"
                style={{ marginRight: iconMarginRight }}
              >
                {titleIcon}
              </div>
            )}
            <h4 className="title">{title}</h4>
          </div>
          <div className="right">
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
