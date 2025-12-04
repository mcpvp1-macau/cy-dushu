import { LoadingOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

type PropsType = {
  title: string
  icon: (props: { className?: string }) => JSX.Element
  disabled?: boolean
  tooltip?: string
  loading?: boolean
  onClick: () => void
}

const ServiceButton: FC<PropsType> = memo((props) => {
  const Icon = props.icon
  const tooltipTitle = props.tooltip ?? props.title

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Button
          className="hidden @[450px]:flex flex-1 h-11 justify-center items-center text-sm"
          disabled={props.disabled}
          onClick={props.onClick}
        >
          <div className="flex flex-col items-center justify-center">
            {props.loading ? (
              <LoadingOutlined />
            ) : (
              <Icon className="text-base -translate-x-[1px] translate-y-[2px]" />
            )}
            <span>{props.title}</span>
          </div>
        </Button>
      </Tooltip>
      <Tooltip title={tooltipTitle}>
        <Button
          className="@[450px]:hidden flex-1 h-11 justify-center items-center text-sm"
          disabled={props.disabled}
          onClick={props.onClick}
        >
          <Icon className="text-base -translate-x-[1px]" />
        </Button>
      </Tooltip>
    </>
  )
})

ServiceButton.displayName = 'ServiceButton'

export default ServiceButton
