import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg fill="none" viewBox="0 0 16 16" {...props}>
      <g>
        <g>
          <g>
            <path
              d="M6.42568,-5.5067062021407764e-14L6.42568,1.587379999999945L1.61078,1.587379999999945L1.61078,6.3159599999999445L0,6.3159599999999445L0,-5.5067062021407764e-14L6.42568,-5.5067062021407764e-14Z"
              fill="currentColor"
              fillRule="evenodd"
              fillOpacity="1"
            />
          </g>
          <g transform="matrix(1,0,0,-1,0,31.999999999999943)">
            <path
              d="M6.42568,15.999999999999972L6.42568,17.58737999999997L1.61078,17.58737999999997L1.61078,22.315959999999972L0,22.315959999999972L0,15.999999999999972L6.42568,15.999999999999972Z"
              fill="currentColor"
              fillRule="evenodd"
              fillOpacity="1"
            />
          </g>
          <g>
            <ellipse
              cx="8"
              cy="7.9999999999999725"
              rx="2"
              ry="2"
              fill="currentColor"
              fillOpacity="1"
            />
          </g>
          <g transform="matrix(-1,0,0,1,32,0)">
            <path
              d="M22.42568,-5.5067062021407764e-14L22.42568,1.587379999999945L17.61078,1.587379999999945L17.61078,6.3159599999999445L16,6.3159599999999445L16,-5.5067062021407764e-14L22.42568,-5.5067062021407764e-14Z"
              fill="currentColor"
              fillRule="evenodd"
              fillOpacity="1"
            />
          </g>
          <g transform="matrix(-1,0,0,-1,32,31.999999999999943)">
            <path
              d="M22.42568,15.999999999999972L22.42568,17.58737999999997L17.61078,17.58737999999997L17.61078,22.315959999999972L16,22.315959999999972L16,15.999999999999972L22.42568,15.999999999999972Z"
              fill="currentColor"
              fillRule="evenodd"
              fillOpacity="1"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

const IconHeaderLogo = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconHeaderLogo
