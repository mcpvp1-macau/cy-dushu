import useUGVMovementControl from '../hooks/useUGVMovementControl'

const UGVControlRuntime: FC = memo(() => {
  useUGVMovementControl()
  return null
})

UGVControlRuntime.displayName = 'UGVControlRuntime'

export default UGVControlRuntime
