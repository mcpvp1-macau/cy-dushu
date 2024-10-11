import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg fill="none" viewBox="0 0 14 14" {...props}>
      <g>
        <path
          d="M1.4,12.6L12.6,12.6L12.6,6.349L14,4.949L14,13.3C14,13.685,13.685,14,13.3,14L0.7,14C0.315,14,0,13.685,0,13.3L0,0.7C0,0.315,0.315,0,0.7,0L9.051,0L7.651,1.4L1.4,1.4L1.4,12.6ZM13.587,2.387C13.846,2.135,14,1.785,14,1.4C14,0.63,13.37,0,12.6,0C12.215,0,11.865,0.154,11.613,0.413L10.458,1.568L12.439,3.549L13.587,2.387ZM11.942,4.03203L6.58699,9.38703L4.60599,7.40603L9.96099,2.05103L11.942,4.03203ZM5.88699,10.0868L2.79999,11.1998L3.91999,8.13379L5.88699,10.0868Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

const IconEdit = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconEdit
