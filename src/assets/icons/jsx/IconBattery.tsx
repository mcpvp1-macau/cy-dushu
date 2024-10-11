import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M597.034667 52.48v63.701333h-533.333334v844.074667h90.922667V1024H0V52.48z"
        fill="currentColor"
      ></path>
      <path
        d="M469.632 213.333333v125.525334h-341.333333V213.333333zM360.106667 469.333333v125.525334H128.341333V469.333333zM256.981333 725.333333v125.525334H128.298667V725.333333zM224.597333 0H384v52.48H224.597333zM1042.773333 1021.824L616.96 193.877333 231.466667 1024l387.498666-169.642667 423.808 167.466667zM619.861333 338.858667L908.544 900.266667l-290.773333-114.858667-257.621334 112.682667 259.712-559.189334z"
        fill="currentColor"
      ></path>
      <path
        d="M619.861333 319.829333v468.906667l-282.88 129.664z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

const IconBattery = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconBattery
