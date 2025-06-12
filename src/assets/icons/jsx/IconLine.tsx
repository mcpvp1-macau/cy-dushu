import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M1024 469.333333v42.666667H0v-42.666667z"
        p-id="28276"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;charset=utf-8;base64,PHN2ZyB0PSIxNzQ5NTUzOTE0NTc1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI4Mjc1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiPjxwYXRoIGQ9Ik0xMDI0IDQ2OS4zMzMzMzN2NDIuNjY2NjY3SDB2LTQyLjY2NjY2N3oiIHAtaWQ9IjI4Mjc2IiBmaWxsPSIjZmZmZmZmIj48L3BhdGg+PC9zdmc+) */
const IconLine = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconLine
