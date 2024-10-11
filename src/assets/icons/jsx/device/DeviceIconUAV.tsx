import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M1024 102.4c0-56.32-46.08-102.4-102.4-102.4-28.16 0-53.76 11.264-72.192 30.208L601.6 278.016 102.4 51.2 51.2 153.6l385.536 288.768L213.504 665.6H51.2l-51.2 51.2 204.8 102.4 102.4 204.8 51.2-51.2v-162.304l223.232-223.232L870.4 972.8l102.4-51.2-226.816-498.688 247.808-247.808A102.178133 102.178133 0 0 0 1024 102.4z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

const DeviceIconUAV = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default DeviceIconUAV
