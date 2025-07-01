import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M1024 478.72v61.866667H0v-61.866667z"
        p-id="20678"
        fill="currentColor"
      ></path>
      <path
        d="M548.650667 637.44h-61.44v-256h61.44zM728.234667 637.44h-61.44v-256h61.44zM907.861333 637.44h-61.44v-256h61.44zM369.024 637.44h-61.44v-256h61.44zM189.44 637.44H128v-256h61.44z"
        p-id="20679"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;charset=utf-8;base64,PHN2ZyB0PSIxNzUxMzQxMDM4NjAwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNjc3IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiPjxwYXRoIGQ9Ik0xMDI0IDQ3OC43MnY2MS44NjY2NjdIMHYtNjEuODY2NjY3eiIgcC1pZD0iMjA2NzgiIGZpbGw9IiNmZmZmZmYiPjwvcGF0aD48cGF0aCBkPSJNNTQ4LjY1MDY2NyA2MzcuNDRoLTYxLjQ0di0yNTZoNjEuNDR6TTcyOC4yMzQ2NjcgNjM3LjQ0aC02MS40NHYtMjU2aDYxLjQ0ek05MDcuODYxMzMzIDYzNy40NGgtNjEuNDR2LTI1Nmg2MS40NHpNMzY5LjAyNCA2MzcuNDRoLTYxLjQ0di0yNTZoNjEuNDR6TTE4OS40NCA2MzcuNDRIMTI4di0yNTZoNjEuNDR6IiBwLWlkPSIyMDY3OSIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg==) */
const IconNoFly = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconNoFly
