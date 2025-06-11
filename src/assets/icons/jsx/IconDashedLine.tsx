import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M0 512v42.666667h146.304v-42.666667H0z m219.434667 0v42.666667H365.653333v-42.666667H219.434667z m219.434666 0v42.666667h146.261334v-42.666667h-146.261334z m219.434667 0v42.666667h146.261333v-42.666667H658.346667z m219.392 0v42.666667H1024v-42.666667h-146.304z"
        p-id="28483"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;charset=utf-8;base64,PHN2ZyB0PSIxNzQ5NTU0MDU4MjQwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI4NDgyIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiPjxwYXRoIGQ9Ik0wIDUxMnY0Mi42NjY2NjdoMTQ2LjMwNHYtNDIuNjY2NjY3SDB6IG0yMTkuNDM0NjY3IDB2NDIuNjY2NjY3SDM2NS42NTMzMzN2LTQyLjY2NjY2N0gyMTkuNDM0NjY3eiBtMjE5LjQzNDY2NiAwdjQyLjY2NjY2N2gxNDYuMjYxMzM0di00Mi42NjY2NjdoLTE0Ni4yNjEzMzR6IG0yMTkuNDM0NjY3IDB2NDIuNjY2NjY3aDE0Ni4yNjEzMzN2LTQyLjY2NjY2N0g2NTguMzQ2NjY3eiBtMjE5LjM5MiAwdjQyLjY2NjY2N0gxMDI0di00Mi42NjY2NjdoLTE0Ni4zMDR6IiBwLWlkPSIyODQ4MyIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg==) */
const IconDashedLine = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconDashedLine
