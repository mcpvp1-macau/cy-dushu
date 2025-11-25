import IconRobot from '@/assets/icons/jsx/IconRobot'
import AsyncButton from '@/components/ui/button/AsyncButton'
import { humanAnswer } from '@/service/modules/human-loop'
import { shouldJson } from '@/utils/json'
import {  LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  humanInTheLoopPayload: any
}

const HumanInLoopDialog: FC<PropsType> = memo(({ humanInTheLoopPayload }) => {
  const my_arguments = useMemo(
    () => shouldJson(humanInTheLoopPayload.function?.arguments),
    [humanInTheLoopPayload],
  )

  const description =
    my_arguments?.__interrupt__?.value?.action_requests?.[0]?.description

  const allow_decisions =
    my_arguments?.__interrupt__?.value?.review_configs?.[0]
      ?.allowed_decisions ?? []

  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="rounded overflow-hidden bg-ground-3 border border-ground-5">
      <div className="bg-ground-4 px-2 py-1 border-b border-ground-5">
        <IconRobot /> 等待答复
      </div>
      <div className="p-2">{description}</div>
      <div className="flex justify-end pb-2 pr-2">
        {!isLoading ? (
          <div className="flex gap-2">
            {allow_decisions?.includes?.('reject') && (
              <AsyncButton
                size="small"
                className="ml-2"
                loading={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await humanAnswer({
                      configurable: {
                        thread_id: humanInTheLoopPayload.id,
                      },
                      resume: {
                        decisions: [
                          {
                            type: 'reject',
                          },
                        ],
                      },
                    })
                  } finally {
                    setIsLoading(false)
                  }
                }}
                successMsg=""
              >
                拒绝
              </AsyncButton>
            )}
            {allow_decisions?.includes?.('approve') && (
              <AsyncButton
                size="small"
                type="primary"
                loading={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await humanAnswer({
                      configurable: {
                        thread_id: humanInTheLoopPayload.id,
                      },
                      resume: {
                        decisions: [
                          {
                            type: 'approve',
                          },
                        ],
                      },
                    })
                  } finally {
                    setIsLoading(false)
                  }
                }}
                successMsg=""
              >
                同意
              </AsyncButton>
            )}
          </div>
        ) : (
          <LoadingOutlined />
        )}
      </div>
    </div>
  )
})

HumanInLoopDialog.displayName = 'HumanInLoopDialog'

export default HumanInLoopDialog
