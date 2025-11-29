import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 3a6 6 0 00-6 6v3.382l-.894 1.789A1 1 0 005.053 16h13.894a1 1 0 00.947-1.829L19 12.382V9a6 6 0 00-7-5.917"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M9 17a3 3 0 006 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const MenuIconAlarm = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default MenuIconAlarm
